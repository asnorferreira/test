import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from './strategy.interface';
import { DomainEvent } from '../dto/domain-event.dto';

@Injectable()
export class N8nApiStrategy implements Strategy {
  private readonly logger = new Logger(N8nApiStrategy.name);

  async handle(event: DomainEvent): Promise<void> {
    this.logger.log(`N8nApiStrategy handling event ${event.id} (channel=${event.metadata.channel})`);
    // implementar integração com API do n8n ou enfileiramento
  }
}