import { FastifyPluginAsync } from 'fastify';

const connectorsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /connectors/service/:tenantId/:provider - Buscar informações do connector
  fastify.get<{
    Params: {
      tenantId: string;
      provider: string;
    };
  }>('/connectors/service/:tenantId/:provider', async (request, reply) => {
    const { tenantId, provider } = request.params;

    fastify.log.info(
      { tenantId, provider },
      'Busca de connector (retornando mock)'
    );

    // Retornar mock de connector (N8N precisa disso para configurar API keys)
    return {
      id: `connector-${tenantId}-${provider}`,
      tenantId,
      provider,
      name: `${provider} Connector`,
      encryptedToken: '', // N8N vai usar as variáveis de ambiente
      createdAt: new Date().toISOString(),
      // Configurações padrão baseadas no provider
      config: {
        apiKey: provider === 'gemini' 
          ? process.env.GOOGLE_GEMINI_API_KEY || ''
          : provider === 'openai'
          ? process.env.OPENAI_API_KEY || ''
          : '',
        model: provider === 'gemini'
          ? process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.0-flash'
          : provider === 'openai'
          ? 'gpt-4'
          : '',
      },
    };
  });
};

export default connectorsRoutes;


