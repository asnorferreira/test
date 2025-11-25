import { FastifyPluginAsync } from 'fastify';

const campaignsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /campaigns/:id/config - Buscar configuração da campanha
  fastify.get<{ Params: { id: string } }>('/campaigns/:id/config', async (request, reply) => {
    const { id } = request.params;
    
    // Mock data - substituir por busca real no banco de dados
    const mockCampaign = {
      id: id,
      aiProvider: 'gemini',
      aiModel: 'gemini-2.0-flash',
      aiEnabled: true,
      tenant: {
        id: 'tenant-1',
        defaultAiProvider: 'gemini',
        defaultAiModel: 'gemini-2.0-flash',
      },
    };

    return mockCampaign;
  });

  // GET /campaigns/:id - Buscar campanha completa
  fastify.get<{ Params: { id: string } }>('/campaigns/:id', async (request, reply) => {
    const { id } = request.params;
    
    // Mock data
    const mockCampaign = {
      id: id,
      name: 'Campanha Mock',
      aiProvider: 'gemini',
      aiModel: 'gemini-2.0-flash',
      aiEnabled: true,
    };

    return mockCampaign;
  });
};

export default campaignsRoutes;

