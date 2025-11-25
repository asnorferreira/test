import { FastifyInstance } from 'fastify';

const HELENA_API_URL = process.env.HELENA_API_URL || 'https://api.helena.run';
const HELENA_API_KEY = process.env.HELENA_API_KEY || '';

export interface HelenaSendMessageParams {
  number: string; // RemoteJID (e.g., "5511999999999")
  body: string;
  options?: {
    queueId?: string | null;
  };
}

export interface HelenaSendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface HelenaMessage {
  id: string;
  sessionId: string;
  text: string;
  senderId: string;
  direction: 'FROM_HUB' | 'TO_HUB';
  timestamp: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  templateId?: string;
  userId?: string;
  status?: string;
  origin?: string;
  fileId?: string;
  refId?: string;
  readContactAt?: string;
  details?: any;
  failedReason?: string;
  filesIds?: string[];
}

/**
 * Envia uma mensagem via API Helena
 */
export async function sendHelenaMessage(
  fastify: FastifyInstance,
  params: HelenaSendMessageParams
): Promise<HelenaSendMessageResponse> {
  if (!HELENA_API_KEY) {
    fastify.log.warn('HELENA_API_KEY não configurada');
    return {
      success: false,
      error: 'HELENA_API_KEY não configurada',
    };
  }

  try {
    // Endpoint correto: /chat/v1/message (para enviar mensagem)
    const response = await fetch(`${HELENA_API_URL}/chat/v1/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${HELENA_API_KEY}`, // Formato: pn_{API_KEY}
      },
      body: JSON.stringify({
        number: params.number,
        body: params.body,
        options: params.options || { queueId: null },
      }),
    });

    // Ler resposta como texto primeiro
    const responseText = await response.text();

    if (!response.ok) {
      fastify.log.error(
        {
          status: response.status,
          statusText: response.statusText,
          body: responseText.substring(0, 200),
        },
        'Erro ao enviar mensagem via Helena API'
      );

      return {
        success: false,
        error: `Helena API error: ${response.status} ${response.statusText}`,
      };
    }

    // Tentar fazer parse do JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      fastify.log.error(
        {
          contentType: response.headers.get('content-type'),
          bodyPreview: responseText.substring(0, 200),
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
        },
        'Resposta da Helena API não é JSON válido ao enviar mensagem'
      );
      return {
        success: false,
        error: 'Resposta da API não é JSON válido',
      };
    }
    fastify.log.info(
      {
        number: params.number,
        messageId: data.id || data.messageId,
      },
      'Mensagem enviada via Helena API'
    );

    return {
      success: true,
      messageId: data.id || data.messageId,
    };
  } catch (error) {
    fastify.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao chamar Helena API'
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Flag para rastrear se já logamos o erro de URL incorreta
let urlErrorLogged = false;

/**
 * Busca mensagens da API Helena (para polling)
 */
export async function fetchHelenaMessages(
  fastify: FastifyInstance,
  options?: {
    limit?: number;
    since?: string; // ISO timestamp
  }
): Promise<any[]> {
  if (!HELENA_API_KEY) {
    fastify.log.warn('HELENA_API_KEY não configurada');
    return [];
  }

  try {
    // Endpoint correto: /chat/v1/message (para listar mensagens)
    const url = new URL(`${HELENA_API_URL}/chat/v1/message`);
    if (options?.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options?.since) {
      url.searchParams.append('since', options.since);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${HELENA_API_KEY}`, // Formato: pn_{API_KEY}
        Accept: 'application/json',
      },
    });

    // Ler resposta como texto primeiro para verificar o formato
    const responseText = await response.text();

    // Verificar se é um erro conhecido da API (mesmo se status for 200)
    if (responseText.includes('ERROR: Incorrect URL') || responseText.includes('InternalPort')) {
      // Logar apenas uma vez para não poluir os logs
      if (!urlErrorLogged) {
        fastify.log.warn(
          {
            status: response.status,
            error: responseText.substring(0, 200),
            apiUrl: HELENA_API_URL,
            endpoint: '/chat/v1/message',
            hint: 'A URL da API ou o endpoint pode estar incorreto. Verifique a documentação da Helena ou entre em contato com o suporte para obter a URL correta da API. O polling continuará tentando mas será desabilitado após 5 erros consecutivos.',
          },
          'API da Helena retornou erro de URL incorreta - verifique HELENA_API_URL no .env'
        );
        urlErrorLogged = true;
      }
      // Lançar erro para que o polling detecte e incremente o contador
      throw new Error('Helena API URL incorreta: ' + responseText.substring(0, 100));
    }
    
    // Reset flag se não for erro de URL
    urlErrorLogged = false;

    if (!response.ok) {
      fastify.log.error(
        {
          status: response.status,
          statusText: response.statusText,
          body: responseText.substring(0, 200), // Primeiros 200 caracteres
        },
        'Erro ao buscar mensagens da Helena API'
      );
      return [];
    }

    // Tentar fazer parse do JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      fastify.log.error(
        {
          contentType: response.headers.get('content-type'),
          bodyPreview: responseText.substring(0, 200),
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
        },
        'Resposta da Helena API não é JSON válido'
      );
      return [];
    }

    // Retornar array de mensagens
    if (Array.isArray(data)) {
      return data;
    }
    // Formato paginado da Helena: { items: [...], totalItems, totalPages, ... }
    if (data && Array.isArray(data.items)) {
      fastify.log.debug(
        {
          count: data.items.length,
          totalItems: data.totalItems,
          pageNumber: data.pageNumber,
          hasMorePages: data.hasMorePages,
        },
        'Mensagens recebidas da Helena API (formato paginado)'
      );
      return data.items;
    }
    if (data && Array.isArray(data.messages)) {
      return data.messages;
    }
    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    fastify.log.warn(
      {
        dataKeys: data ? Object.keys(data) : null,
      },
      'Formato de resposta da Helena API inesperado'
    );
    return [];
  } catch (error) {
    fastify.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Erro ao buscar mensagens da Helena API'
    );
    return [];
  }
}

/**
 * Busca mensagens de uma sessão específica usando a API da Helena
 */
export async function fetchMessagesBySessionId(
  fastify: FastifyInstance,
  sessionId: string
): Promise<HelenaMessage[]> {
  if (!HELENA_API_KEY) {
    fastify.log.warn('HELENA_API_KEY não configurada');
    return [];
  }

  if (!sessionId) {
    fastify.log.warn('sessionId é obrigatório para fetchMessagesBySessionId');
    return [];
  }

  try {
    // Buscar todas as mensagens recentes e filtrar por sessionId
    // A Helena API pode não suportar filtro direto por sessionId
    fastify.log.debug(
      {
        sessionId,
      },
      'Buscando mensagens recentes e filtrando por sessionId'
    );
    
    // Buscar todas as mensagens recentes (últimas 500 para garantir que pegamos as da sessão)
    const allMessages = await fetchHelenaMessages(fastify, { limit: 500 });
    
    // Filtrar por sessionId
    const sessionMessages = allMessages.filter(
      (msg: any) => msg && msg.sessionId === sessionId
    ) as HelenaMessage[];
    
    fastify.log.info(
      {
        sessionId,
        totalMessagesFetched: allMessages.length,
        sessionMessagesCount: sessionMessages.length,
      },
      'Mensagens da sessão buscadas e filtradas'
    );
    
    return sessionMessages;
  } catch (error) {
    fastify.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        sessionId,
      },
      'Erro ao buscar mensagens por sessionId da Helena API'
    );
    return [];
  }
}

/**
 * Busca uma mensagem específica por ID usando a API da Helena
 */
export async function fetchMessageById(
  fastify: FastifyInstance,
  messageId: string
): Promise<HelenaMessage | null> {
  if (!HELENA_API_KEY) {
    fastify.log.warn('HELENA_API_KEY não configurada');
    return null;
  }

  try {
    // Endpoint: GET /chat/v1/message/{messageId}
    const response = await fetch(`${HELENA_API_URL}/chat/v1/message/${messageId}`, {
      method: 'GET',
      headers: {
        Authorization: `pn_${HELENA_API_KEY}`, // Formato: pn_{API_KEY}
        Accept: 'application/json',
      },
    });

    // Ler resposta como texto primeiro
    const responseText = await response.text();

    if (!response.ok) {
      fastify.log.error(
        {
          status: response.status,
          statusText: response.statusText,
          body: responseText.substring(0, 200),
          messageId,
        },
        'Erro ao buscar mensagem por ID da Helena API'
      );
      return null;
    }

    // Tentar fazer parse do JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      fastify.log.error(
        {
          contentType: response.headers.get('content-type'),
          bodyPreview: responseText.substring(0, 200),
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          messageId,
        },
        'Resposta da Helena API não é JSON válido ao buscar mensagem por ID'
      );
      return null;
    }

    fastify.log.debug(
      {
        messageId,
        sessionId: data.sessionId,
        direction: data.direction,
        timestamp: data.timestamp,
      },
      'Mensagem buscada com sucesso da Helena API'
    );

    return data as HelenaMessage;
  } catch (error) {
    fastify.log.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        messageId,
      },
      'Erro ao buscar mensagem por ID da Helena API'
    );

    return null;
  }
}


