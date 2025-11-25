'use client';

import { useState, useCallback } from 'react';

export interface Conversation {
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

export interface ConversationAnalysis {
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

interface UseConversationsOptions {
  onFetchConversations?: () => Promise<Conversation[]>;
}

export function useConversations(options?: UseConversationsOptions) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (options?.onFetchConversations) {
        const data = await options.onFetchConversations();
        setConversations(data);
      } else {
        const response = await fetch('/api/conversations');
        const result = await response.json();
        if (result.success) {
          setConversations(result.conversations || []);
        } else {
          setError(result.error || 'Erro ao buscar conversas');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar conversas');
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.onFetchConversations]);

  const fetchConversationAnalysis = useCallback(
    async (conversation: Conversation): Promise<ConversationAnalysis | null> => {
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
          return result;
        } else {
          throw new Error(result.error || 'Erro ao buscar análise');
        }
      } catch (err: any) {
        console.error('Erro ao buscar análise:', err);
        throw err;
      }
    },
    []
  );

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    fetchConversationAnalysis,
  };
}

