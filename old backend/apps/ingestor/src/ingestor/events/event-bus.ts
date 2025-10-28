import { EventEmitter } from 'events';
import { DomainEvent } from '../dto/domain-event.dto';

class EventBus extends EventEmitter {
  publish(topic: string, event: DomainEvent) {
    this.emit(topic, event);
  }

  subscribe(topic: string, handler: (event: DomainEvent) => void) {
    this.on(topic, handler);
  }
}

export const eventBus = new EventBus();