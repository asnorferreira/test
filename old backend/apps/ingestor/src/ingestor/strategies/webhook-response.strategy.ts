import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from './strategy.interface';
import { DomainEvent } from '../dto/domain-event.dto';
import axios from 'axios';

@Injectable()
export class WebhookResponseStrategy implements Strategy {
  private readonly logger = new Logger(WebhookResponseStrategy.name);

  async handle(event: DomainEvent): Promise<void> {
    const url = event.metadata.returnUrl;
    if (!url) {
      this.logger.warn('WebhookResponseStrategy: no returnUrl, skipping.');
      return;
    }

    this.logger.log(`WebhookResponseStrategy: calling returnUrl ${url}`);
    const payload = {
      conversationId: event.metadata.conversationId,
      reply: 'ok',
      original: event.metadata.raw,
      processedAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(url, payload, { headers: { 'content-type': 'application/json' } });
      this.logger.log(`Return webhook status ${res.status} for ${event.id}`);
    } catch (err) {
      const message = (err as any)?.response?.data || (err as Error).message;
      this.logger.error('Error calling returnUrl', message);
    }
  }
}