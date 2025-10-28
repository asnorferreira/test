import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { DomainEvent } from './dto/domain-event.dto';

@Injectable()
export class IngestorService {
  private readonly logger = new Logger(IngestorService.name);
  private readonly events: DomainEvent[] = [];

  async processEvent(event: WebhookEventDto, domainEvent: DomainEvent): Promise<void> {
    this.logger.log(`Recebido novo evento para a conversa: ${event.metadata.conversationId}`);
    this.events.push(domainEvent);

    this.logger.log(`Publicando evento normalizado para o tópico "conversation_events"`);
  }

  findAll(): DomainEvent[] {
    return this.events;
  }

  findOne(id: string): DomainEvent {
    const event = this.events.find(e => e.id === id);
    if (!event) {
      throw new NotFoundException(`Evento com ID "${id}" não encontrado.`);
    }
    return event;
  }
}