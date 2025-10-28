import { Injectable, Logger } from '@nestjs/common';
import { StrategyFactory } from '../factories/strategy.factory';
import { eventBus } from '../events/event-bus';
import { DomainEvent } from '../dto/domain-event.dto';

@Injectable()
export class ProcessEventUseCase {
  private readonly logger = new Logger(ProcessEventUseCase.name);

  constructor(private readonly factory: StrategyFactory) {
    eventBus.subscribe('conversation.event', this.execute.bind(this));
  }

  async execute(event: DomainEvent) {
    this.logger.log(`ProcessEventUseCase received event ${event.id}`);
    const strategy = this.factory.create(event);
    try {
      await strategy.handle(event);
      this.logger.log(`Event ${event.id} processed by strategy`);
    } catch (err) {
      this.logger.error('Error executing strategy', (err as Error).message);
    }
  }
}