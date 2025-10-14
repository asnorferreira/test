import { Injectable } from '@nestjs/common';
import { Strategy } from '../strategies/strategy.interface';
import { N8nApiStrategy } from '../strategies/n8n-api.strategy';
import { WebhookResponseStrategy } from '../strategies/webhook-response.strategy';
import { DomainEvent } from '../dto/domain-event.dto';

@Injectable()
export class StrategyFactory {
  constructor(
    private readonly webhookStrategy: WebhookResponseStrategy,
    private readonly n8nApiStrategy: N8nApiStrategy,
  ) {}

  create(event: DomainEvent): Strategy {
    if (event.metadata.returnUrl) {
      return this.webhookStrategy;
    }

    switch (event.metadata.channel) {
      case 'whatsapp':
      case 'chat':
      case 'voice':
        return this.n8nApiStrategy;
      default:
        return this.n8nApiStrategy;
    }
  }
}