'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, CheckSquare, Search, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { ConversationModal } from './ConversationModal';

interface Conversation {
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

interface ConversationAnalysis {
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
  aiOutput?: any;
}

interface SidebarProps {
  // Callback extensível para buscar conversas de sistema externo
  onFetchConversations?: () => Promise<Conversation[]>;
}

export function Sidebar({ onFetchConversations }: SidebarProps) {
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [analysisData, setAnalysisData] = useState<ConversationAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    {
      href: '/ai-summary',
      label: 'Resumo IA',
      icon: FileText,
    },
    {
      href: '/checklists',
      label: 'Checklists',
      icon: CheckSquare,
    },
  ];

  // Buscar conversas
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      if (onFetchConversations) {
        // Usar callback customizado se fornecido
        const data = await onFetchConversations();
        setConversations(data);
      } else {
        // Buscar via API padrão
        const response = await fetch('/api/conversations');
        const result = await response.json();
        if (result.success) {
          setConversations(result.conversations || []);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
    }
  }, [onFetchConversations]);

  // Buscar análise de uma conversa específica
  const fetchConversationAnalysis = useCallback(async (conversation: Conversation) => {
    setLoadingAnalysis(true);
    setSelectedConversation(conversation);
    setIsModalOpen(true);

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.conversationId || conversation.id,
          conversationData: conversation,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalysisData(result);
      } else {
        console.error('Erro ao buscar análise:', result.error);
        setAnalysisData(null);
      }
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      setAnalysisData(null);
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  // Carregar conversas ao montar
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Filtrar conversas por termo de busca
  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.conversationId?.toLowerCase().includes(search) ||
      conv.id?.toLowerCase().includes(search) ||
      conv.text?.toLowerCase().includes(search) ||
      conv.metadata?.clientName?.toLowerCase().includes(search) ||
      conv.metadata?.agentName?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <aside className="min-h-screen bg-white border-r border-gray-200 p-6 w-1/4 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IA</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Intermedius</h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">Resumo de conversas do whatsapp</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Conversations Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversas
            </h2>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchConversations}
              disabled={loading}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Atualizar Lista'
              )}
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading && conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Carregando conversas...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id || conversation.conversationId}
                  onClick={() => fetchConversationAnalysis(conversation)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {conversation.metadata?.clientName || 'Cliente'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {conversation.text || 'Sem mensagem'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conversation.conversationId || conversation.id}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Modal */}
      <ConversationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedConversation(null);
          setAnalysisData(null);
        }}
        conversationId={selectedConversation?.conversationId || selectedConversation?.id || ''}
        checklist={analysisData?.checklist || []}
        suggestions={analysisData?.suggestions || []}
        blockers={analysisData?.blockers || []}
        nudges={analysisData?.nudges || []}
        next_action={analysisData?.next_action || null}
        aiOutput={analysisData?.aiOutput || null}
      />
      {loadingAnalysis && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-700">Carregando análise...</p>
          </div>
        </div>
      )}
    </>
  );
}