'use client';

import { useState, useEffect } from 'react';
import { useConversations } from '../hooks/useConversations';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ChecklistsPage() {
  const { conversations, fetchConversations, loading } = useConversations();
  const [allChecklists, setAllChecklists] = useState<any[]>([]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Buscar checklists de todas as conversas
  useEffect(() => {
    if (conversations.length > 0) {
      Promise.all(
        conversations.slice(0, 5).map((conv) =>
          fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: conv.conversationId || conv.id,
              conversationData: conv,
            }),
          })
            .then((res) => res.json())
            .then((data) => ({
              conversationId: conv.conversationId || conv.id,
              checklist: data.checklist || [],
            }))
            .catch(() => ({ conversationId: conv.conversationId || conv.id, checklist: [] }))
        )
      ).then((results) => {
        setAllChecklists(results);
      });
    }
  }, [conversations]);

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warn':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'done':
        return 'bg-green-50 border-green-200';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checklists</h1>
      
      {loading ? (
        <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Carregando checklists...</p>
        </div>
      ) : allChecklists.length > 0 ? (
        <div className="space-y-6">
          {allChecklists.map((item) => (
            <div key={item.conversationId} className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Conversa: {item.conversationId}
              </h2>
              {item.checklist.length > 0 ? (
                <div className="space-y-2">
                  {item.checklist.map((checkItem: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border flex items-start gap-3 ${getStateColor(checkItem.state)}`}
                    >
                      {getStateIcon(checkItem.state)}
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {checkItem.item.replace(/_/g, ' ')}
                        </p>
                        {checkItem.notes && (
                          <p className="text-sm text-gray-600 mt-1">{checkItem.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum item no checklist</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
          <p className="text-gray-600">
            Nenhum checklist disponível. Selecione conversas no menu lateral para ver os dados.
          </p>
        </div>
      )}
    </div>
  );
}