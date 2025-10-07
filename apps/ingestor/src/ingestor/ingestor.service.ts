import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class IngestorService {
  private readonly logger = new Logger(IngestorService.name);

  async processEvent(event: WebhookEventDto): Promise<void> {
    this.logger.log(`Recebido novo evento para a conversa: ${event.metadata.conversationId}`);

    const normalizedEvent = {
      ...event,
      processedAt: new Date(),
      source: 'ingestor-service',
    };

    this.logger.log(`Publicando evento normalizado para o tópico "conversation_events"`);
    console.log(normalizedEvent);

  }
}