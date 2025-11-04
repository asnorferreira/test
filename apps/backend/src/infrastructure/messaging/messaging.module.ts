import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection } from 'amqplib';
import { IMessageBus } from 'apps/backend/src/interfaces/outbound/message-bus.port';
import { AmqpMessageBus } from 'apps/backend/src/adapters/outbound/messaging/amqp-message-bus';
import { ServicesConfig } from 'apps/backend/src/infrastructure/config/config.service';

export const AMQP_CONNECTION = Symbol('AMQP_CONNECTION');

@Module({
  providers: [
    {
      provide: AMQP_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('AMQPModule');
        const config = configService.get<ServicesConfig['messageBus']>(
          'services.messageBus',
          { infer: true },
        );
        try {
          logger.log(`Conectando ao Message Bus: ${config.url}`);
          const connection: Connection = await connect(config.url);
          
          connection.on('error', (err) => {
            logger.error('Erro na conexão AMQP', err);
          });
          connection.on('close', () => {
            logger.warn('Conexão AMQP fechada. Tentando reconectar...');
            // TODO: Implementar lógica de reconexão
          });

          logger.log('Conexão AMQP estabelecida.');
          return connection;
        } catch (error) {
          logger.error('Falha ao conectar ao Message Bus AMQP', error);
          process.exit(1);
        }
      },
      inject: [ConfigService],
    },
    {
      provide: IMessageBus,
      useClass: AmqpMessageBus,
    },
  ],
  exports: [IMessageBus],
})
export class MessagingModule {}