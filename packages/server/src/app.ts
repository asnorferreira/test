import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';

const port = process.env.PORT || process.env.API_GATEWAY_PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Registrar CORS - permitir requisições do domínio Intermedius e Helena
  await fastify.register(fastifyCors, {
    origin: [
      'https://intermedius.app.br',
      'http://intermedius.app.br',
      'https://api.intermedius.app.br',
      'http://api.intermedius.app.br',
      'http://localhost:3000',
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      /^https?:\/\/intermedius\.app\.br/,
      /^https?:\/\/.*intermedius.*/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Rota de health check
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        messages: '/api/messages/process',
        stream: '/api/stream/conversations',
        helena: '/helena/webhook'
      }
    };
  });
  
  // Health check alternativo (com /api)
  fastify.get('/api/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        messages: '/api/messages/process',
        stream: '/api/stream/conversations',
        helena: '/helena/webhook'
      }
    };
  });

  // Registrar rotas
  const { default: campaignsRoutes } = await import('./routes/campaigns.js');
  const { default: policiesRoutes } = await import('./routes/policies.js');
  const { default: auditRoutes } = await import('./routes/audit.js');
  const { default: coachRoutes } = await import('./routes/coach.js');
  const { default: helenaRoutes } = await import('./routes/helena.js');
  const { default: streamingRoutes } = await import('./routes/streaming.js');
  const { default: connectorsRoutes } = await import('./routes/connectors.js');
  const { default: webhookRoutes } = await import('./routes/webhooks.js');
  
  await fastify.register(campaignsRoutes);
  await fastify.register(policiesRoutes);
  await fastify.register(auditRoutes);
  await fastify.register(coachRoutes);
  await fastify.register(helenaRoutes);
  await fastify.register(streamingRoutes);
  await fastify.register(connectorsRoutes);
  await fastify.register(webhookRoutes);

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    
    await server.listen({ 
      port: Number(port), 
      host: host 
    });
    
    console.log(`🚀 Server running on http://${host}:${port}`);
    
    // Iniciar serviços em background
    const { startHelenaPolling } = await import('./services/helena-polling.js');
    startHelenaPolling(server);
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      const { stopHelenaPolling } = await import('./services/helena-polling.js');
      stopHelenaPolling(server);
      await server.close();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      const { stopHelenaPolling } = await import('./services/helena-polling.js');
      stopHelenaPolling(server);
      await server.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();

