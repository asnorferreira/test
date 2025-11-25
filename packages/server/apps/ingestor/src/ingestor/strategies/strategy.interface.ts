import { DomainEvent } from '../dto/domain-event.dto';

export interface Strategy {
  handle(event: DomainEvent): Promise<void>;
}