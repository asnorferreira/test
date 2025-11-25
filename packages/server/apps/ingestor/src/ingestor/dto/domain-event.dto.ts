export type Channel = 'whatsapp' | 'voice' | 'chat' | string;

export interface Metadata {
  conversationId: string;
  channel: Channel;
  returnUrl?: string;
  raw?: unknown;
  agentName?: string;
  clientName?: string;
}

export interface DomainEvent {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  metadata: Metadata;
}