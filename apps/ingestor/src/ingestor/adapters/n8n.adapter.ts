import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventDto } from '../dto/webhook-event.dto';
import { DomainEvent, Metadata } from '../dto/domain-event.dto';

@Injectable()
export class N8nAdapter {
  private readonly logger = new Logger(N8nAdapter.name);

  toDomain(event: WebhookEventDto): DomainEvent {
    const metadata: Metadata = {
      conversationId: (event.metadata && event.metadata.conversationId) || `${event.author}:${Date.now()}`,
      channel: (event.metadata && event.metadata.channel) || 'unknown',
      returnUrl: (event.metadata && (event.metadata as any).returnUrl) || undefined,
      raw: event,
    };

    const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

    const domainEvent: DomainEvent = {
      id: `${metadata.channel}:${metadata.conversationId}`,
      author: event.author || 'unknown',
      text: event.text || '',
      timestamp,
      metadata,
    };

    this.logger.debug(`Converted incoming webhook to DomainEvent ${domainEvent.id}`);
    return domainEvent;
  }
}