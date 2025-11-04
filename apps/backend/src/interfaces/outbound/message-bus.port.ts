export interface BusMessage {
  payload: any;
  headers: Record<string, string>;
  correlationId: string;
}

export type Unsubscribe = () => Promise<void>;

export interface IMessageBus {
  publish(
    topic: string,
    payload: any,
    headers?: Record<string, string>,
  ): Promise<void>;

  subscribe(
    topic: string,
    handler: (msg: BusMessage) => Promise<void>,
  ): Promise<Unsubscribe>;
}

export const IMessageBus = Symbol('IMessageBus');