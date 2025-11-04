import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import {
  BusMessage,
  IMessageBus,
  Unsubscribe,
} from 'apps/backend/src/interfaces/outbound/message-bus.port';
import { ServicesConfig } from 'apps/backend/src/infrastructure/config/config.service';
import { AMQP_CONNECTION } from 'apps/backend/src/infrastructure/messaging/messaging.module';
import { randomUUID } from 'crypto';

@Injectable()
export class AmqpMessageBus implements IMessageBus, OnModuleInit {
  private readonly logger = new Logger(AmqpMessageBus.name);
  private publisherChannel: Channel;
  private consumerChannel: Channel;
  private readonly config: ServicesConfig['messageBus'];

  constructor(
    @Inject(AMQP_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<ServicesConfig['messageBus']>(
      'services.messageBus',
      { infer: true },
    );
  }

  async onModuleInit() {
    await this.initChannels();
  }

  private async initChannels() {
    try {
      this.logger.log('Inicializando canais AMQP (Publisher e Consumer)');
      this.publisherChannel = await this.connection.createChannel();
      this.consumerChannel = await this.connection.createChannel();

      await this.publisherChannel.assertExchange(
        this.config.exchange,
        'topic',
        { durable: true },
      );

      this.logger.log(`Exchange [${this.config.exchange}] garantido.`);
    } catch (error) {
      this.logger.error('Falha ao inicializar canais AMQP', error);
      throw error;
    }
  }

  async publish(
    topic: string,
    payload: any,
    headers: Record<string, string> = {},
  ): Promise<void> {
    const correlationId = headers.correlationId || randomUUID();
    
    const messageHeaders = {
      ...headers,
      correlationId,
      timestamp: Date.now(),
    };

    const content = Buffer.from(JSON.stringify(payload));

    try {
      this.publisherChannel.publish(
        this.config.exchange,
        topic,
        content,
        {
          contentType: 'application/json',
          persistent: true,
          headers: messageHeaders,
          correlationId: correlationId,
        },
      );
    } catch (error) {
      this.logger.error(`Falha ao publicar no tópico [${topic}]`, error);
      // TODO: Implementar retry ou dead-letter
    }
  }

  async subscribe(
    topic: string,
    handler: (msg: BusMessage) => Promise<void>,
  ): Promise<Unsubscribe> {
    
    const queueName = `${this.config.exchange}.${topic}`; 
    await this.consumerChannel.assertQueue(queueName, { durable: true });
    
    await this.consumerChannel.bindQueue(queueName, this.config.exchange, topic);
    
    this.logger.log(`Inscrito no tópico [${topic}] (Fila: ${queueName})`);

    const { consumerTag } = await this.consumerChannel.consume(
      queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          this.logger.warn(`Consumo cancelado no tópico [${topic}]`);
          return;
        }

        const correlationId = msg.properties.correlationId || randomUUID();
        const busMessage: BusMessage = {
          payload: JSON.parse(msg.content.toString()),
          headers: msg.properties.headers as Record<string, string>,
          correlationId,
        };

        try {
          // TODO: Adicionar tracing (OTel)
          await handler(busMessage);
          this.consumerChannel.ack(msg);
        } catch (error) {
          this.logger.error(
            `Erro ao processar mensagem do tópico [${topic}] (CorrID: ${correlationId})`,
            error,
          );
          this.consumerChannel.nack(msg, false, false);
        }
      },
    );

    return async () => {
      this.logger.log(`Cancelando inscrição de [${consumerTag}]`);
      await this.consumerChannel.cancel(consumerTag);
    };
  }
}