import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db/prisma.js';
import { callN8NWebhook } from '../services/n8n-service.js';
import { broadcastSSEEvent, hasActiveSSEConnection, getSessionConnectionTimestamp, getActiveSSEConnectionsCount } from './streaming.js';
import { fetchMessageById, fetchMessagesBySessionId } from '../services/helena-api.js';

const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/messages/process - Receber messageId da extensão, buscar detalhes e processar
  fastify.post<{
    Body: {
      messageId: string;
    };
  }>('/api/messages/process', async (request, reply) => {
    const { messageId } = request.body;

    if (!messageId) {
      return reply.code(400).send({
        success: false,
        error: 'messageId é obrigatório',
      });
    }

    try {
      fastify.log.info(
        {
          messageId,
        },
        'MessageId recebido da extensão - buscando detalhes'
      );

      // Buscar detalhes completos da mensagem usando fetchMessageById
      const helenaMessage = await fetchMessageById(fastify, messageId);
      
      if (!helenaMessage) {
        fastify.log.warn(
          {
            messageId,
          },
          'Não foi possível buscar mensagem da Helena API'
        );
        return reply.code(404).send({
          success: false,
          error: 'Mensagem não encontrada na Helena API',
        });
      }
      
      // Extrair sessionId da mensagem
      const sessionId = helenaMessage.sessionId;
      
      if (!sessionId) {
        fastify.log.warn(
          {
            messageId,
          },
          'Mensagem da Helena não tem sessionId'
        );
        return reply.code(400).send({
          success: false,
          error: 'Mensagem não tem sessionId',
        });
      }
      
      // Verificar se há conexão SSE ativa (genérica ou específica para esse sessionId)
      const hasSpecificConnection = hasActiveSSEConnection(sessionId);
      const hasGenericConnection = getActiveSSEConnectionsCount() > 0; // Se houver qualquer conexão SSE, processar
      
      if (!hasSpecificConnection && !hasGenericConnection) {
        fastify.log.debug(
          {
            messageId,
            sessionId,
          },
          'Mensagem ignorada - não há conexão SSE ativa'
        );
        return reply.code(200).send({
          success: true,
          processed: false,
          reason: 'Sem conexão SSE ativa',
        });
      }
      
      // Verificar se é mensagem nova (após conexão SSE) apenas se houver conexão específica
      if (hasSpecificConnection) {
        const conexaoTimestamp = getSessionConnectionTimestamp(sessionId);
        if (conexaoTimestamp) {
          const messageTimestamp = new Date(helenaMessage.timestamp);
          if (messageTimestamp <= conexaoTimestamp) {
            fastify.log.debug(
              {
                messageId,
                sessionId,
                messageTimestamp: messageTimestamp.toISOString(),
                conexaoTimestamp: conexaoTimestamp.toISOString(),
              },
              'Mensagem ignorada - chegou antes da conexão SSE'
            );
            return reply.code(200).send({
              success: true,
              processed: false,
              reason: 'Mensagem antiga (antes da conexão SSE)',
            });
          }
        }
      }
      
      // Mapear direção da Helena para author
      const author = helenaMessage.direction === 'FROM_HUB' ? 'agent' : 'cliente';
      
      // Extrair texto da mensagem
      const messageText = helenaMessage.text || '';
      
      if (!messageText) {
        fastify.log.warn(
          {
            messageId,
            sessionId,
          },
          'Mensagem da Helena não tem texto'
        );
        return reply.code(400).send({
          success: false,
          error: 'Mensagem não tem texto',
        });
      }

      // Usar sessionId como conversationId
      const conversationId = sessionId;
      const turnId = `turn-${Date.now()}`;
      const timestamp = new Date(helenaMessage.timestamp);

      // Buscar ou criar conversa usando sessionId
      let conversation = await prisma.conversation.findUnique({
        where: { conversationId },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            conversationId,
            channel: 'web',
            tenantId: 'demo',
            status: 'active',
          },
        });
      }

      // Verificar se mensagem já foi processada
      const existingMessage = await prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
          metadata: {
            path: ['messageId'],
            equals: messageId,
          },
        },
      });

      if (existingMessage) {
        fastify.log.debug(
          {
            messageId,
            conversationId,
          },
          'Mensagem já foi processada anteriormente'
        );
        return reply.code(200).send({
          success: true,
          processed: false,
          reason: 'Mensagem já processada',
        });
      }

      // Buscar histórico de mensagens
      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { timestamp: 'asc' },
        take: 50,
      });

      // Criar mensagem no banco
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          author,
          text: messageText,
          timestamp,
          type: helenaMessage.type || 'text',
          metadata: {
            messageId: helenaMessage.id,
            sessionId: helenaMessage.sessionId,
            senderId: helenaMessage.senderId,
            direction: helenaMessage.direction,
            turnId,
          },
        },
      });

      // Preparar histórico para N8N
      const history = messages.map((msg) => ({
        id: msg.id,
        author: msg.author,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      }));

      // Chamar N8N webhook
      const n8nResult = await callN8NWebhook(fastify, {
        id: message.id,
        author,
        text: messageText,
        timestamp: timestamp.toISOString(),
        metadata: {
          conversationId,
          turnId,
          channel: 'web',
          campaignId: conversation.campaignId || undefined,
          agentName: 'Agente',
          clientName: helenaMessage.senderId || 'Cliente',
          history,
        },
      });

      // Se N8N retornou dados de análise, fazer broadcast via SSE
      if (n8nResult.success && n8nResult.data) {
        broadcastSSEEvent(
          {
            type: 'analysis:updated',
            payload: {
              conversationId: sessionId,
              turnId,
              analysis: {
                checklist: n8nResult.data.checklist || [],
                suggestions: n8nResult.data.suggestions || [],
                blockers: n8nResult.data.blockers || [],
                nudges: n8nResult.data.nudges || [],
                nextAction: n8nResult.data.next_action || n8nResult.data.nextAction,
              },
            },
          },
          {
            tenantId: conversation.tenantId,
            conversationId: sessionId,
          }
        );
      }

      fastify.log.info(
        {
          messageId,
          conversationId,
          messageDbId: message.id,
          n8nSuccess: n8nResult.success,
        },
        'MessageId processado com sucesso'
      );

      return {
        success: true,
        processed: true,
        messageId: message.id,
        conversationId,
        n8nSuccess: n8nResult.success,
      };
    } catch (error) {
      fastify.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          messageId,
        },
        'Erro ao processar messageId'
      );

      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
  // GET /api/sessions/:sessionId/messages - Buscar messageIds de uma sessão
  fastify.get<{
    Params: {
      sessionId: string;
    };
  }>('/api/sessions/:sessionId/messages', async (request, reply) => {
    const { sessionId } = request.params;

    if (!sessionId) {
      return reply.code(400).send({
        success: false,
        error: 'sessionId é obrigatório',
      });
    }

    try {
      fastify.log.info(
        {
          sessionId,
        },
        'Buscando mensagens da sessão da Helena API'
      );

      // Buscar mensagens da sessão usando Helena API
      const messages = await fetchMessagesBySessionId(fastify, sessionId);

      // Extrair apenas os messageIds
      const messageIds = messages
        .map((msg) => msg.id)
        .filter((id) => id && id.trim().length > 0);

      fastify.log.info(
        {
          sessionId,
          totalMessages: messages.length,
          messageIdsCount: messageIds.length,
        },
        'Mensagens da sessão buscadas com sucesso'
      );

      return reply.code(200).send({
        success: true,
        sessionId,
        messageIds,
        messages: messages.map((msg) => ({
          id: msg.id,
          sessionId: msg.sessionId,
          text: msg.text,
          direction: msg.direction,
          timestamp: msg.timestamp,
        })),
      });
    } catch (error) {
      fastify.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          sessionId,
        },
        'Erro ao buscar mensagens da sessão'
      );

      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  // POST /api/webhooks/n8n - DESATIVADO: Extensão não envia mais mensagens diretamente
  // Mensagens agora vêm via webhooks da Helena (POST /helena/webhook)
  fastify.post<{
    Body: any;
  }>('/api/webhooks/n8n', async (request, reply) => {
    fastify.log.warn(
      {
        endpoint: '/api/webhooks/n8n',
        body: request.body,
      },
      'Endpoint /api/webhooks/n8n foi desativado - mensagens agora vêm via webhooks da Helena'
    );
    
    return reply.code(410).send({
      success: false,
      error: 'Endpoint desativado. Mensagens agora vêm via webhooks da Helena (POST /helena/webhook).',
      message: 'A extensão não deve mais enviar mensagens diretamente. O backend busca mensagens da Helena API usando webhooks.',
    });
  });
  
  /* Código antigo removido - abaixo está o código original comentado para referência:
  fastify.post<{
    Body: {
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
      };
    };
  }>('/api/webhooks/n8n', async (request, reply) => {
    const { author, text, timestamp, metadata } = request.body;

    if (!author || !text || !metadata?.conversationId) {
      return reply.code(400).send({
        success: false,
        error: 'Campos obrigatórios: author, text, metadata.conversationId',
      });
    }

    try {
      fastify.log.info(
        {
          conversationId: metadata.conversationId,
          author,
          textLength: text.length,
          channel: metadata.channel || 'web',
        },
        'Mensagem recebida da extensão'
      );

      // Buscar ou criar conversa
      let conversation = await prisma.conversation.findUnique({
        where: { conversationId: metadata.conversationId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 50,
          },
        },
      });

      if (!conversation) {
        fastify.log.info(
          { conversationId: metadata.conversationId },
          'Conversa não encontrada, criando nova conversa'
        );

        conversation = await prisma.conversation.create({
          data: {
            conversationId: metadata.conversationId,
            channel: metadata.channel || 'web',
            tenantId: 'demo',
            status: 'active',
            campaignId: metadata.campaignId,
          },
          include: {
            messages: true,
          },
        });
      }

      // Validar e preparar timestamp
      let messageTimestamp: Date;
      try {
        messageTimestamp = new Date(timestamp);
        // Verificar se a data é válida
        if (isNaN(messageTimestamp.getTime())) {
          fastify.log.warn({ timestamp }, 'Timestamp inválido, usando data atual');
          messageTimestamp = new Date();
        }
      } catch (error) {
        fastify.log.warn({ timestamp, error }, 'Erro ao processar timestamp, usando data atual');
        messageTimestamp = new Date();
      }

      // Validar texto (deve ser string não vazia)
      if (typeof text !== 'string' || text.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'text é obrigatório e deve ser uma string não vazia',
        });
      }

      // Salvar mensagem no banco
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          author,
          text: text.trim(),
          timestamp: messageTimestamp,
          type: 'text',
          metadata: {
            turnId: metadata.turnId || `turn-${Date.now()}`,
            channel: metadata.channel || 'web',
          },
        },
      });

      fastify.log.info(
        {
          messageId: message.id,
          conversationId: metadata.conversationId,
          author,
        },
        'Mensagem salva no banco'
      );

      // Preparar histórico para N8N
      const history = conversation.messages
        .concat([message])
        .map((msg) => ({
          id: msg.id,
          author: msg.author,
          text: msg.text,
          timestamp: msg.timestamp.toISOString(),
        }));

      // Chamar N8N webhook
      fastify.log.info(
        {
          conversationId: metadata.conversationId,
          messageId: message.id,
          n8nUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/intermedius',
        },
        'Enviando mensagem para N8N'
      );

      const n8nResult = await callN8NWebhook(fastify, {
        id: message.id,
        author,
        text,
        timestamp,
        metadata: {
          conversationId: metadata.conversationId,
          turnId: metadata.turnId || `turn-${Date.now()}`,
          channel: metadata.channel || 'web',
          campaignId: metadata.campaignId,
          agentName: metadata.agentName || 'Agente',
          clientName: metadata.clientName || metadata.conversationId,
          history,
        },
      });

      if (!n8nResult.success) {
        fastify.log.error(
          {
            conversationId: metadata.conversationId,
            messageId: message.id,
            error: n8nResult.error,
          },
          'Erro ao chamar N8N'
        );
      } else {
        fastify.log.info(
          {
            conversationId: metadata.conversationId,
            messageId: message.id,
            hasData: !!n8nResult.data,
          },
          'N8N chamado com sucesso'
        );

        // Se N8N retornou dados, fazer broadcast via SSE
        if (n8nResult.data) {
          broadcastSSEEvent(
            {
              type: 'analysis:updated',
              payload: {
                conversationId: metadata.conversationId,
                turnId: metadata.turnId || `turn-${Date.now()}`,
                analysis: {
                  checklist: n8nResult.data.checklist || [],
                  suggestions: n8nResult.data.suggestions || [],
                  blockers: n8nResult.data.blockers || [],
                  nudges: n8nResult.data.nudges || [],
                  nextAction: n8nResult.data.next_action || n8nResult.data.nextAction,
                },
              },
            },
            {
              conversationId: metadata.conversationId,
            }
          );
        }
      }

      return {
        success: true,
        messageId: message.id,
        conversationId: metadata.conversationId,
        n8nSuccess: n8nResult.success,
        n8nError: n8nResult.error,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      fastify.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          conversationId: metadata?.conversationId,
        },
        'Erro ao processar webhook da extensão'
      );

      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
  */
};

export default webhookRoutes;

