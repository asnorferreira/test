import { FastifyPluginAsync } from 'fastify';

const auditRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /audit - Registrar log de auditoria
  fastify.post<{
    Body: {
      conversationId: string;
      turnId: string;
      analysis: {
        checklist?: Array<any>;
        suggestions?: Array<any>;
        blockers?: Array<any>;
        nudges?: Array<any>;
        next_action?: string;
        metadata?: {
          provider?: string;
          model?: string;
          processingMetrics?: any;
          validation?: any;
          execution?: any;
          textAnalysis?: any;
        };
      };
      timestamp: string;
    };
  }>('/audit', async (request, reply) => {
    const { conversationId, turnId, analysis, timestamp } = request.body;

    // Log do audit (em produção, salvaria no banco de dados)
    fastify.log.info({
      conversationId,
      turnId,
      timestamp,
      provider: analysis.metadata?.provider,
      model: analysis.metadata?.model,
      hasChecklist: !!analysis.checklist?.length,
      hasSuggestions: !!analysis.suggestions?.length,
      hasBlockers: !!analysis.blockers?.length,
      hasNudges: !!analysis.nudges?.length,
    }, 'Audit log received');

    // Retornar sucesso
    return {
      success: true,
      conversationId,
      turnId,
      timestamp: new Date().toISOString(),
      message: 'Audit log registered',
    };
  });
};

export default auditRoutes;


