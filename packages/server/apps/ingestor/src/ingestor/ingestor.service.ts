import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { DomainEvent } from './dto/domain-event.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class IngestorService {
  private readonly logger = new Logger(IngestorService.name);

  constructor(
    @InjectQueue('conversation-events')
    private readonly conversationQueue: Queue,
  ) {}

  async processEvent(event: WebhookEventDto, domainEvent: DomainEvent): Promise<void> {
    const { conversationId } = event.metadata;
    this.logger.log(`Enfileirando evento para a conversa: ${conversationId}`);

    try {
      await this.conversationQueue.add(
        'new-message',
        domainEvent,
        {
          jobId: domainEvent.id, 
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      );

      this.logger.log(`Evento ${domainEvent.id} (Conversa: ${conversationId}) enfileirado com sucesso.`);
    } catch (error) {
      this.logger.error(`Falha ao enfileirar job para conversa ${conversationId}: ${error.message}`, error.stack);
      throw new Error(`Falha ao enfileirar job: ${error.message}`);
    }
  }

  findAll(): string {
    return 'Serviço de Ingestão está rodando. Os eventos estão sendo processados pela fila.';
  }
  findOne(id: string): string {
    return `O evento ${id} foi enfileirado. Verifique o dashboard do BullMQ ou os logs do Worker.`;
  }
}