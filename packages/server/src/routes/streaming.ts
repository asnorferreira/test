import { FastifyPluginAsync } from 'fastify';

// Armazenar conexões SSE ativas
const sseConnections = new Set<{ reply: any; tenantId?: string; conversationId?: string; connectedAt: Date }>();

// Mapa para rastrear timestamp de conexão por sessionId (conversationId é o sessionId)
const sessionConnectionTimestamps = new Map<string, Date>();

// Função para broadcast de eventos para todas as conexões SSE
export function broadcastSSEEvent(
  event: {
    type: string;
    payload: any;
  },
  filter?: {
    tenantId?: string;
    conversationId?: string;
  }
) {
  const message = `data: ${JSON.stringify(event)}\n\n`;
  
  sseConnections.forEach((connection) => {
    // Filtrar por tenant se especificado
    if (filter?.tenantId && connection.tenantId !== filter.tenantId) {
      return;
    }

    // Filtrar por conversationId se especificado
    if (filter?.conversationId && connection.conversationId !== filter.conversationId) {
      return;
    }

    try {
      connection.reply.raw.write(message);
    } catch (error) {
      // Remover conexão se houver erro
      sseConnections.delete(connection);
    }
  });
}

const streamingRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/stream/conversations/:conversationId - Server-Sent Events filtrado por conversationId
  fastify.get<{
    Params: {
      conversationId: string;
    };
    Querystring: {
      tenantId?: string;
    };
  }>('/api/stream/conversations/:conversationId', async (request, reply) => {
    const { conversationId } = request.params;
    const { tenantId } = request.query;

    // Configurar headers SSE
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no'); // Desabilitar buffering do nginx
    
    // Headers CORS explícitos para SSE
    const origin = request.headers.origin;
    if (origin && (
      origin.includes('intermedius.app.br') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    )) {
      reply.raw.setHeader('Access-Control-Allow-Origin', origin);
      reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Adicionar conexão à lista
    const connectedAt = new Date();
    const connection = {
      reply,
      tenantId,
      conversationId,
      connectedAt,
    };
    sseConnections.add(connection);
    
    // Armazenar timestamp de conexão para esse sessionId (conversationId é o sessionId)
    sessionConnectionTimestamps.set(conversationId, connectedAt);

    fastify.log.info(
      {
        conversationId,
        tenantId,
        totalConnections: sseConnections.size,
      },
      'Nova conexão SSE estabelecida (filtrada por conversationId)'
    );

    // Enviar evento inicial de conexão
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected', payload: { conversationId, timestamp: new Date().toISOString() } })}\n\n`);

    // Manter conexão aberta
    request.raw.on('close', () => {
      sseConnections.delete(connection);
      // Remover timestamp de conexão se não houver mais conexões SSE para esse sessionId
      const hasOtherConnections = Array.from(sseConnections).some(
        c => c.conversationId === conversationId
      );
      if (!hasOtherConnections) {
        sessionConnectionTimestamps.delete(conversationId);
      }
      fastify.log.info(
        {
          conversationId,
          tenantId,
          totalConnections: sseConnections.size,
        },
        'Conexão SSE fechada'
      );
    });

    // Não finalizar a resposta - manter conexão aberta
    return reply;
  });

  // GET /api/stream/conversations - Server-Sent Events para tempo real (genérico, mantido para compatibilidade)
  fastify.get<{
    Querystring: {
      tenantId?: string;
    };
  }>('/api/stream/conversations', async (request, reply) => {
    const { tenantId } = request.query;

    // Configurar headers SSE
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no'); // Desabilitar buffering do nginx
    
    // Headers CORS explícitos para SSE
    const origin = request.headers.origin;
    if (origin && (
      origin.includes('intermedius.app.br') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    )) {
      reply.raw.setHeader('Access-Control-Allow-Origin', origin);
      reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Usar um ID genérico para conexões sem conversationId específico
    const genericConnectionId = `generic-${Date.now()}`;
    const connectedAt = new Date();
    
    // Adicionar conexão à lista (sem conversationId específico, será filtrada quando necessário)
    const connection = {
      reply,
      tenantId,
      conversationId: undefined, // Não tem conversationId específico
      connectedAt,
    };
    sseConnections.add(connection);
    
    // Registrar timestamp de conexão genérica (será usado quando sessionId for conhecido)
    sessionConnectionTimestamps.set(genericConnectionId, connectedAt);

    fastify.log.info(
      {
        connectionId: genericConnectionId,
        tenantId,
        totalConnections: sseConnections.size,
        activeSessions: sessionConnectionTimestamps.size,
      },
      'Nova conexão SSE genérica estabelecida (aguardando messageIds)'
    );

    // Enviar evento inicial de conexão
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected', payload: { connectionId: genericConnectionId, timestamp: new Date().toISOString() } })}\n\n`);

    // Manter conexão aberta
    request.raw.on('close', () => {
      sseConnections.delete(connection);
      sessionConnectionTimestamps.delete(genericConnectionId);
      fastify.log.info(
        {
          connectionId: genericConnectionId,
          tenantId,
          totalConnections: sseConnections.size,
          activeSessions: sessionConnectionTimestamps.size,
        },
        'Conexão SSE genérica fechada'
      );
    });

    // Não finalizar a resposta - manter conexão aberta
    return reply;
  });
};

// Função para obter timestamp de conexão de um sessionId
export function getSessionConnectionTimestamp(sessionId: string): Date | null {
  return sessionConnectionTimestamps.get(sessionId) || null;
}

// Função para verificar se há conexão SSE ativa para um sessionId
export function hasActiveSSEConnection(sessionId: string): boolean {
  return Array.from(sseConnections).some(
    connection => connection.conversationId === sessionId
  );
}

// Retorna o número de conexões SSE ativas
export function getActiveSSEConnectionsCount(): number {
  return sseConnections.size;
}

export default streamingRoutes;


