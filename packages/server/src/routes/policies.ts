import { FastifyPluginAsync } from 'fastify';

const policiesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /policies?campaignId=xxx - Buscar políticas da campanha
  fastify.get<{ Querystring: { campaignId?: string } }>('/policies', async (request, reply) => {
    const { campaignId } = request.query;
    
    // Mock data - substituir por busca real no banco de dados
    const mockPolicies = {
      campaignId: campaignId || 'default',
      regua: {
        desconto_max: 15,
        descontoMax: 15,
        parcelas: [1, 2, 3, 6, 12],
        entrada_minima: 10,
        entradaMinima: 10,
        termos_proibidos: ['grátis', 'de graça', 'sem custo'],
        termosProibidos: ['grátis', 'de graça', 'sem custo'],
      },
      pillars: [
        {
          name: 'apresentacao',
          description: 'Apresentação adequada do agente',
          weight: 10,
          isActive: true,
        },
        {
          name: 'proposta_2opcoes',
          description: 'Apresentar pelo menos 2 opções de proposta',
          weight: 15,
          isActive: true,
        },
      ],
      scripts: [
        {
          category: 'Saudação',
          body: 'Olá! Como posso ajudar você hoje?',
        },
        {
          category: 'Encerramento',
          body: 'Foi um prazer atendê-lo. Tenha um ótimo dia!',
        },
      ],
    };

    return mockPolicies;
  });
};

export default policiesRoutes;


