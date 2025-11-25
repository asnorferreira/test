import { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma.js';
import { fetchHelenaMessages } from './helena-api.js';
import { callN8NWebhook } from './n8n-service.js';
import { broadcastSSEEvent } from '../routes/streaming.js';

const HELENA_POLLING_ENABLED = process.env.HELENA_POLLING_ENABLED === 'true';
const HELENA_POLLING_INTERVAL = parseInt(process.env.HELENA_POLLING_INTERVAL || '5000', 10);

let pollingInterval: NodeJS.Timeout | null = null;
let lastPollTimestamp: Date | null = null;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5; // Desabilitar após 5 erros consecutivos

/**
 * Processa uma mensagem da Helena (similar ao webhook)
 */
async function processHelenaMessage(
  fastify: FastifyInstance,
  messageData: any
) {
  try {
    // Validar dados
    if (!messageData.from || !messageData.body) {
      return;
    }

    // Filtrar mensagens próprias
    if (messageData.isFromMe === true) {
      return;
    }

    const conversationId = `helena-${messageData.from}`;
    const turnId = `turn-${Date.now()}`;
    const timestamp = messageData.timestamp
      ? new Date(messageData.timestamp)
      : new Date();

    // Verificar se mensagem já foi processada
    const existingMessage = await prisma.message.findFirst({
      where: {
        conversation: {
          conversationId,
        },
        text: messageData.body,
        timestamp: {
          gte: new Date(timestamp.getTime() - 1000), // 1 segundo de tolerância
          lte: new Date(timestamp.getTime() + 1000),
        },
      },
    });

    if (existingMessage) {
      fastify.log.debug(
        { conversationId, messageId: messageData.id },
        'Mensagem já processada - ignorando'
      );
      return;
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findUnique({
      where: { conversationId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          conversationId,
          channel: 'whatsapp',
          tenantId: 'demo',
          status: 'active',
        },
      });
    }

    // Buscar histórico
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: 'asc' },
      take: 50,
    });

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        author: 'cliente',
        text: messageData.body,
        timestamp,
        type: messageData.type || 'text',
        metadata: messageData as any,
      },
    });

    // Preparar histórico para N8N
    const history = messages.map((msg) => ({
      id: msg.id,
      author: msg.author,
      text: msg.text,
      timestamp: msg.timestamp.toISOString(),
    }));

    // Chamar N8N
    await callN8NWebhook(fastify, {
      id: message.id,
      author: 'cliente',
      text: messageData.body,
      timestamp: timestamp.toISOString(),
      metadata: {
        conversationId,
        turnId,
        channel: 'whatsapp',
        campaignId: conversation.campaignId || undefined,
        agentName: 'Agente',
        clientName: messageData.from,
        history,
      },
    });

    // Broadcast SSE
    broadcastSSEEvent(
      {
        type: 'message:received',
        payload: {
          conversationId,
          messageId: message.id,
          author: 'cliente',
          text: messageData.body,
          timestamp: timestamp.toISOString(),
        },
      },
      {
        tenantId: conversation.tenantId,
        conversationId,
      }
    );

    fastify.log.info(
      {
        conversationId,
        messageId: message.id,
        method: 'polling',
      },
      'Mensagem processada via polling'
    );
  } catch (error) {
    fastify.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        messageData,
      },
      'Erro ao processar mensagem via polling'
    );
  }
}

/**
 * Executa um ciclo de polling
 */
async function pollHelenaMessages(fastify: FastifyInstance) {
  try {
    const since = lastPollTimestamp
      ? lastPollTimestamp.toISOString()
      : new Date(Date.now() - 60000).toISOString(); // Último minuto se primeira vez

    const messages = await fetchHelenaMessages(fastify, {
      since,
      limit: 100,
    });

    // Reset contador de erros se sucesso (mesmo que array vazio)
    consecutiveErrors = 0;

    if (messages.length > 0) {
      fastify.log.info(
        { count: messages.length, since },
        'Mensagens encontradas via polling'
      );

      // Processar cada mensagem
      for (const message of messages) {
        await processHelenaMessage(fastify, message);
      }
    }

    lastPollTimestamp = new Date();
  } catch (error) {
    consecutiveErrors++;
    
    // Logar apenas a cada 5 erros ou no último antes de desabilitar
    const shouldLog = consecutiveErrors === 1 || 
                      consecutiveErrors % 5 === 0 || 
                      consecutiveErrors >= MAX_CONSECUTIVE_ERRORS;
    
    if (shouldLog) {
      fastify.log.warn(
        {
          error: error instanceof Error ? error.message : String(error),
          consecutiveErrors,
          maxErrors: MAX_CONSECUTIVE_ERRORS,
          action: consecutiveErrors >= MAX_CONSECUTIVE_ERRORS 
            ? 'Polling será desabilitado automaticamente' 
            : 'Continuando tentativas...',
        },
        'Erro no ciclo de polling da Helena'
      );
    }

    // Desabilitar polling após muitos erros consecutivos
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      fastify.log.error(
        {
          consecutiveErrors,
          action: 'Polling desabilitado automaticamente. Configure HELENA_POLLING_ENABLED=false no .env ou corrija a URL da API.',
        },
        'Muitos erros consecutivos no polling da Helena - desabilitando'
      );
      stopHelenaPolling(fastify);
    }
  }
}

/**
 * Inicia o serviço de polling
 */
export function startHelenaPolling(fastify: FastifyInstance) {
  if (!HELENA_POLLING_ENABLED) {
    fastify.log.info('Polling da Helena desabilitado');
    return;
  }

  if (pollingInterval) {
    fastify.log.warn('Polling da Helena já está rodando');
    return;
  }

  // Reset contador de erros ao iniciar
  consecutiveErrors = 0;

  fastify.log.info(
    {
      interval: HELENA_POLLING_INTERVAL,
      note: 'Se a API da Helena não estiver configurada, desabilite com HELENA_POLLING_ENABLED=false',
    },
    'Iniciando polling da Helena'
  );

  // Primeira execução imediata
  pollHelenaMessages(fastify);

  // Configurar intervalo
  pollingInterval = setInterval(() => {
    pollHelenaMessages(fastify);
  }, HELENA_POLLING_INTERVAL);
}

/**
 * Para o serviço de polling
 */
export function stopHelenaPolling(fastify: FastifyInstance) {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    consecutiveErrors = 0; // Reset contador
    fastify.log.info('Polling da Helena parado');
  }
}

