import { NextRequest, NextResponse } from 'next/server';

// Tipo para dados de conversa
interface ConversationData {
  id: string;
  conversationId: string;
  text?: string;
  author?: string;
  timestamp?: string;
  metadata?: {
    conversationId?: string;
    turnId?: string;
    campaignId?: string;
    channel?: string;
    agentName?: string;
    clientName?: string;
    [key: string]: any;
  };
}

// Tipo para resposta do N8N
interface N8NResponse {
  success: boolean;
  conversationId: string;
  turnId: string;
  checklist: Array<{
    item: string;
    state: string;
    score?: number | null;
    notes?: string | null;
    evidence?: any;
  }>;
  suggestions: Array<{
    label: string;
    text: string;
    priority?: string;
  }>;
  blockers: any[];
  nudges: any[];
  next_action?: string | null;
  aiOutput?: {
    provider: string;
    model: string;
    analysis: {
      checklist: any[];
      suggestions: any[];
    };
  };
}

// Função para buscar conversas de sistema externo
// Esta função pode ser customizada para buscar de diferentes sistemas
async function fetchConversationsFromExternalSystem(): Promise<ConversationData[]> {
  // TODO: Implementar busca real de sistema externo (WhatsApp, etc)
  // Por enquanto retorna array vazio - será implementado via callback extensível
  return [];
}

// GET /api/conversations - Buscar lista de conversas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'external';
    
    // Se houver callback customizado, usar ele
    // Por enquanto, busca padrão
    const conversations = await fetchConversationsFromExternalSystem();
    
    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao buscar conversas',
      },
      { status: 500 }
    );
  }
}

// POST /api/conversations/:id/analyze - Buscar dados de análise do N8N para uma conversa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, conversationData } = body;

    if (!conversationId && !conversationData) {
      return NextResponse.json(
        {
          success: false,
          error: 'conversationId ou conversationData é obrigatório',
        },
        { status: 400 }
      );
    }

    // Preparar dados para enviar ao N8N
    const n8nPayload = conversationData || {
      id: conversationId,
      conversationId: conversationId,
      text: '',
      author: 'cliente',
      timestamp: new Date().toISOString(),
      metadata: {
        conversationId: conversationId,
        campaignId: '982b0125-9dd1-497c-8134-4f6fb60d3e76',
        channel: 'whatsapp',
      },
    };

    // Chamar webhook do N8N
    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/intermedius';
    const serviceToken = process.env.SERVICE_TOKEN || '';

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-token': serviceToken,
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      throw new Error(`N8N retornou erro: ${response.status} ${response.statusText}`);
    }

    const n8nData: N8NResponse = await response.json();

    // Formatar resposta para o frontend
    return NextResponse.json({
      success: true,
      conversationId: n8nData.conversationId,
      turnId: n8nData.turnId,
      checklist: n8nData.checklist || [],
      suggestions: n8nData.suggestions || [],
      blockers: n8nData.blockers || [],
      nudges: n8nData.nudges || [],
      next_action: n8nData.next_action || null,
      aiOutput: n8nData.aiOutput || null,
      processing: n8nData.processing || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao buscar dados do N8N',
      },
      { status: 500 }
    );
  }
}

