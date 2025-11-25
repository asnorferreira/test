export interface ConversationEvent {
  author: 'atendente' | 'cliente';
  text: string;
  timestamp: string;
  metadata: {
    conversationId: string;
    channel: 'whatsapp' | 'voice' | 'chat';
    campaignId: string;
    tenantId: string;
  };
  processedAt: string;
  source: string;
}