import { FastifyInstance } from 'fastify';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/intermedius';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || '';

export interface N8NWebhookPayload {
  id?: string;
  author: 'cliente' | 'agent';
  text: string;
  timestamp: string;
  metadata: {
    conversationId: string;
    turnId: string;
    channel: string;
    campaignId?: string;
    agentName?: string;
    clientName?: string;
    serviceToken?: string;
    providerOverride?: string;
    history?: Array<{
      id: string;
      author: string;
      text: string;
      timestamp: string;
    }>;
  };
}

export interface N8NWebhookResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Chama o webhook do N8N com os dados formatados
 */
export async function callN8NWebhook(
  fastify: FastifyInstance,
  payload: N8NWebhookPayload
): Promise<N8NWebhookResponse> {
  if (!N8N_WEBHOOK_URL) {
    fastify.log.warn('N8N_WEBHOOK_URL não configurada');
    return {
      success: false,
      error: 'N8N_WEBHOOK_URL não configurada',
    };
  }

  try {
    // Preparar payload completo para o N8N
    const n8nPayload = {
      id: payload.id || `msg-${Date.now()}`,
      author: payload.author,
      text: payload.text,
      timestamp: payload.timestamp,
      metadata: {
        ...payload.metadata,
        serviceToken: SERVICE_TOKEN || payload.metadata.serviceToken,
      },
    };

    fastify.log.info(
      {
        conversationId: payload.metadata.conversationId,
        turnId: payload.metadata.turnId,
        author: payload.author,
        textLength: payload.text.length,
        n8nUrl: N8N_WEBHOOK_URL,
        hasServiceToken: !!SERVICE_TOKEN,
        historyLength: payload.metadata.history?.length || 0,
      },
      'Chamando webhook do N8N'
    );

    fastify.log.debug(
      {
        url: N8N_WEBHOOK_URL,
        payload: JSON.stringify(n8nPayload, null, 2),
      },
      'Payload completo sendo enviado ao N8N'
    );

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-token': SERVICE_TOKEN || '',
        accept: '*/*',
        'accept-language': '*',
        'user-agent': 'intermedius-backend',
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      fastify.log.error(
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          conversationId: payload.metadata.conversationId,
        },
        'Erro ao chamar webhook do N8N'
      );

      return {
        success: false,
        error: `N8N webhook error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    fastify.log.info(
      {
        conversationId: payload.metadata.conversationId,
        turnId: payload.metadata.turnId,
        hasSuggestions: !!data.suggestions?.length,
        hasChecklist: !!data.checklist?.length,
      },
      'Webhook N8N chamado com sucesso'
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    fastify.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        conversationId: payload.metadata.conversationId,
      },
      'Erro ao chamar webhook do N8N'
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}


