import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db/prisma.js';
import { broadcastSSEEvent } from './streaming.js';
import { callN8NWebhook } from '../services/n8n-service.js';

const coachRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /coach/analyze/:conversationId - Forçar análise de uma conversa existente
  fastify.post<{
    Params: {
      conversationId: string;
    };
  }>('/coach/analyze/:conversationId', async (request, reply) => {
    const { conversationId } = request.params;

    try {
      // Buscar conversa
      const conversation = await prisma.conversation.findUnique({
        where: { conversationId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 50, // Últimas 50 mensagens
          },
        },
      });

      if (!conversation) {
        return reply.code(404).send({
          success: false,
          error: 'Conversa não encontrada',
        });
      }

      // Preparar histórico para N8N
      const history = conversation.messages.map((msg) => ({
        id: msg.id,
        author: msg.author,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      }));

      // Pegar a última mensagem do cliente (ou criar uma mensagem fictícia)
      const lastClientMessage = conversation.messages
        .filter((msg) => msg.author === 'cliente')
        .pop();

      if (!lastClientMessage) {
        return reply.code(400).send({
          success: false,
          error: 'Conversa não possui mensagens do cliente',
        });
      }

      // Chamar N8N
      fastify.log.info(
        {
          conversationId,
          messageCount: history.length,
        },
        'Forçando análise da conversa via N8N'
      );

      const n8nResult = await callN8NWebhook(fastify, {
        id: lastClientMessage.id,
        author: 'cliente',
        text: lastClientMessage.text,
        timestamp: lastClientMessage.timestamp.toISOString(),
        metadata: {
          conversationId,
          turnId: `turn-${Date.now()}`,
          channel: conversation.channel || 'whatsapp',
          campaignId: conversation.campaignId || undefined,
          agentName: 'Agente',
          clientName: conversationId,
          history,
        },
      });

      if (!n8nResult.success) {
        fastify.log.error(
          {
            conversationId,
            error: n8nResult.error,
          },
          'Erro ao chamar N8N para análise'
        );
      }

      return {
        success: n8nResult.success,
        error: n8nResult.error,
        data: n8nResult.data,
        conversationId,
        messageCount: history.length,
        message: n8nResult.success
          ? 'Análise solicitada ao N8N. Aguarde o retorno via webhook.'
          : `Erro ao chamar N8N: ${n8nResult.error}`,
      };
    } catch (error) {
      fastify.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          conversationId,
        },
        'Erro ao forçar análise da conversa'
      );

      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  // POST /test/n8n - Endpoint de teste para chamar N8N sem depender da Helena
  fastify.post<{
    Body: {
      conversationId?: string;
      message?: string;
    };
  }>('/test/n8n', async (request, reply) => {
    const { conversationId = 'test-' + Date.now(), message = 'Mensagem de teste' } = request.body;

    try {
      const result = await callN8NWebhook(fastify, {
        id: `test-msg-${Date.now()}`,
        author: 'cliente',
        text: message,
        timestamp: new Date().toISOString(),
        metadata: {
          conversationId,
          turnId: `turn-${Date.now()}`,
          channel: 'test',
          agentName: 'Teste',
          clientName: 'Cliente Teste',
          history: [],
        },
      });

      return {
        success: result.success,
        error: result.error,
        data: result.data,
        message: result.success 
          ? 'N8N chamado com sucesso. Verifique os logs do backend e do N8N.' 
          : 'Erro ao chamar N8N. Verifique N8N_WEBHOOK_URL no .env',
      };
    } catch (error) {
      fastify.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        'Erro no endpoint de teste do N8N'
      );

      return reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
  // POST /coach/webhook/suggestion - Receber sugestões do N8N
  fastify.post<{
    Body: {
      conversationId?: string;
      turnId?: string;
      checklist?: Array<any>;
      suggestions?: Array<any>;
      blockers?: Array<any>;
      nudges?: Array<any>;
      next_action?: string;
      aiOutput?: {
        provider?: string;
        model?: string;
        analysis?: any;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }>('/coach/webhook/suggestion', async (request, reply) => {
    const body = request.body;
    
    // Extrair dados do payload (suporta múltiplos formatos)
    const conversationId = body.conversationId || body.payload?.conversationId || body.id;
    const turnId = body.turnId || body.payload?.turnId || `turn-${Date.now()}`;
    const checklist = body.checklist || body.payload?.checklist || [];
    const suggestions = body.suggestions || body.payload?.suggestions || [];
    const blockers = body.blockers || body.payload?.blockers || body.pre_send_blockers || [];
    const nudges = body.nudges || body.payload?.nudges || [];
    const nextAction = body.next_action || body.payload?.next_action || body.nextAction;
    const aiOutput = body.aiOutput || body.payload?.aiOutput || {};
    const aiProvider = aiOutput.provider || body.provider || 'unknown';
    const aiModel = aiOutput.model || body.model;

    if (!conversationId) {
      fastify.log.warn({ body }, 'Coach suggestion recebida sem conversationId');
      return reply.code(400).send({
        success: false,
        error: 'conversationId é obrigatório',
      });
    }

    try {
      // Buscar conversa
      let conversation = await prisma.conversation.findUnique({
        where: { conversationId },
      });

      // Se não encontrou, criar a conversa (pode vir de teste direto do N8N)
      if (!conversation) {
        fastify.log.info(
          { conversationId },
          'Conversa não encontrada, criando nova conversa para análise do coach'
        );
        
        conversation = await prisma.conversation.create({
          data: {
            conversationId,
            channel: 'whatsapp',
            tenantId: 'demo',
            status: 'active',
          },
        });
      }

      // Salvar análise no banco
      const analysis = await prisma.coachAnalysis.create({
        data: {
          conversationId: conversation.id,
          turnId,
          checklist: checklist.length > 0 ? checklist : null,
          suggestions: suggestions.length > 0 ? suggestions : null,
          blockers: blockers.length > 0 ? blockers : null,
          nudges: nudges.length > 0 ? nudges : null,
          nextAction: nextAction || null,
          aiProvider: aiProvider || null,
          aiModel: aiModel || null,
          rawResponse: body as any,
        },
      });

      // Atualizar conversa com última análise
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastAnalysisId: analysis.id,
          updatedAt: new Date(),
        },
      });

      // Broadcast SSE para frontend
      broadcastSSEEvent(
        {
          type: 'analysis:updated',
          payload: {
            conversationId,
            turnId,
            analysis: {
              id: analysis.id,
              checklist,
              suggestions,
              blockers,
              nudges,
              nextAction,
              aiProvider,
              aiModel,
              createdAt: analysis.createdAt.toISOString(),
            },
          },
        },
        {
          tenantId: conversation.tenantId,
          conversationId,
        }
      );

      fastify.log.info({
        conversationId,
        turnId,
        analysisId: analysis.id,
        hasChecklist: checklist.length > 0,
        hasSuggestions: suggestions.length > 0,
        hasBlockers: blockers.length > 0,
        hasNudges: nudges.length > 0,
        aiProvider,
      }, 'Coach suggestion salva e broadcast enviado');

      return {
        success: true,
        conversationId,
        turnId,
        analysisId: analysis.id,
        timestamp: new Date().toISOString(),
        message: 'Suggestion received and processed',
      };
    } catch (error) {
      fastify.log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          conversationId,
          turnId,
        },
        'Erro ao processar coach suggestion'
      );

      return reply.code(500).send({
        success: false,
        error: 'Erro ao processar sugestão',
      });
    }
  });
};

export default coachRoutes;

