import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db/prisma.js';
import { callN8NWebhook } from '../services/n8n-service.js';
import { broadcastSSEEvent, getSessionConnectionTimestamp, hasActiveSSEConnection } from './streaming.js';
import { fetchMessageById, HelenaMessage } from '../services/helena-api.js';

const helenaRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /helena/webhook - Receber eventos da Helena
  fastify.post<{
    Body: {
      event?: string;
      messageId?: string; // ID da mensagem para buscar detalhes
      data?: {
        id?: string; // messageId também pode vir aqui
        from?: string; // RemoteJID (legado)
        body?: string; // Texto (legado)
        type?: string;
        isFromMe?: boolean;
        timestamp?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }>('/helena/webhook', async (request, reply) => {
    const payload = request.body;
    const event = payload.event || 'message:created';
    const data = payload.data || {};
    
    // Extrair messageId do payload (pode estar em messageId, data.id, etc.)
    const messageId = payload.messageId || data.id || data.messageId;

    // Retornar 200 OK imediatamente (fire-and-forget)
    reply.code(200).send({ received: true });

    // Processar assincronamente
    setImmediate(async () => {
      try {
        // Validar payload - precisa ter messageId para buscar detalhes
        if (!messageId) {
          fastify.log.warn(
            {
              event,
              hasMessageId: !!messageId,
              payloadKeys: Object.keys(payload),
            },
            'Payload da Helena inválido - messageId ausente'
          );
          return;
        }
        
        // Buscar detalhes completos da mensagem usando fetchMessageById
        const helenaMessage = await fetchMessageById(fastify, messageId);
        
        if (!helenaMessage) {
          fastify.log.warn(
            {
              messageId,
              event,
            },
            'Não foi possível buscar mensagem da Helena API'
          );
          return;
        }
        
        // Extrair sessionId da mensagem
        const sessionId = helenaMessage.sessionId;
        
        if (!sessionId) {
          fastify.log.warn(
            {
              messageId,
              helenaMessage: Object.keys(helenaMessage),
            },
            'Mensagem da Helena não tem sessionId'
          );
          return;
        }
        
        // Verificar se há conexão SSE ativa para esse sessionId
        if (!hasActiveSSEConnection(sessionId)) {
          fastify.log.debug(
            {
              messageId,
              sessionId,
            },
            'Mensagem ignorada - não há conexão SSE ativa para esse sessionId'
          );
          // Salvar webhook mas não processar
          await prisma.helenaWebhook.create({
            data: {
              event,
              data: payload as any,
              processed: true,
              error: 'Sem conexão SSE ativa',
            },
          });
          return;
        }
        
        // Verificar se é mensagem nova (após conexão SSE)
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
            // Salvar webhook mas não processar
            await prisma.helenaWebhook.create({
              data: {
                event,
                data: payload as any,
                processed: true,
                error: 'Mensagem antiga (antes da conexão SSE)',
              },
            });
            return;
          }
        }
        
        // Mapear direção da Helena para author
        // direction: 'FROM_HUB' → author: 'agent'
        // direction: 'TO_HUB' → author: 'cliente'
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
          return;
        }

        // Salvar webhook no banco
        const webhook = await prisma.helenaWebhook.create({
          data: {
            event,
            data: payload as any,
            processed: false,
          },
        });

        // Gerar IDs
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
              channel: 'web', // Web chat da Helena
              campaignId: request.headers['x-campaign-id'] as string || undefined,
              tenantId: (request.headers['x-tenant-id'] as string) || 'demo',
              status: 'active',
            },
          });
        }

        // Buscar histórico de mensagens
        const messages = await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { timestamp: 'asc' },
          take: 50, // Últimas 50 mensagens
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
            channel: 'web', // Web chat da Helena
            campaignId: conversation.campaignId || undefined,
            agentName: 'Agente',
            clientName: helenaMessage.senderId || 'Cliente',
            history,
            sessionId,
            messageId: helenaMessage.id,
          },
        });

        // Marcar webhook como processado
        if (webhook) {
          await prisma.helenaWebhook.update({
            where: { id: webhook.id },
            data: {
              processed: true,
              conversationId: conversation.id,
            },
          });
        }

        // Broadcast SSE para frontend usando sessionId - mensagem recebida
        broadcastSSEEvent(
          {
            type: 'message:received',
            payload: {
              conversationId: sessionId,
              messageId: message.id,
              author,
              text: messageText,
              timestamp: timestamp.toISOString(),
            },
          },
          {
            tenantId: conversation.tenantId,
            conversationId: sessionId,
          }
        );

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
            conversationId,
            messageId: message.id,
            n8nSuccess: n8nResult.success,
          },
          'Mensagem da Helena processada com sucesso'
        );
      } catch (error) {
        fastify.log.error(
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            event,
            data,
          },
          'Erro ao processar webhook da Helena'
        );

        // Marcar webhook com erro (se foi criado)
        // Nota: webhook pode não ter sido criado se falhou antes
      }
    });

    return { received: true };
  });
};

export default helenaRoutes;

