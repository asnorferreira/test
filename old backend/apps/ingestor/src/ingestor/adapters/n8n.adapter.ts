import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventDto } from '../dto/webhook-event.dto';
import { DomainEvent, Metadata } from '../dto/domain-event.dto';

@Injectable()
export class N8nAdapter {
  private readonly logger = new Logger(N8nAdapter.name);

  private getConversationId(event: WebhookEventDto): string {
    const { agentName, clientName, conversationId } = event.metadata || {};
    if (agentName && clientName) {
      const agentSlug = agentName.replace(/\s/g, '-').toLowerCase();
      const clientSlug = clientName.replace(/\s/g, '-').toLowerCase();
      return `${agentSlug}_${clientSlug}`;
    }

    return conversationId || `${event.author}:${Date.now()}`;
  }

  toDomain(event: WebhookEventDto): DomainEvent {
    const metadataFromEvent = event.metadata; 
    const conversationId = this.getConversationId(event);

    const metadata: Metadata = {
      conversationId: conversationId,
      channel: metadataFromEvent.channel,
      returnUrl: metadataFromEvent.returnUrl,
      raw: event,
      agentName: metadataFromEvent.agentName,
      clientName: metadataFromEvent.clientName,
    };

    const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

    const domainEvent: DomainEvent = {
      id: conversationId,
      author: event.author || 'unknown',
      text: event.text || '',
      timestamp,
      metadata,
    };

    this.logger.debug(`Converted incoming webhook to DomainEvent ${domainEvent.id}`);
    return domainEvent;
  }
}