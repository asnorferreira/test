'use client';

import { useState, useEffect } from 'react';
import { useConversations } from '../hooks/useConversations';
import { Lightbulb, ListChecks, AlertCircle } from 'lucide-react';

export default function AISummaryPage() {
  const { conversations, fetchConversations, loading } = useConversations();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Buscar análise da primeira conversa como exemplo
  useEffect(() => {
    if (conversations.length > 0 && !selectedAnalysis) {
      const firstConv = conversations[0];
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: firstConv.conversationId || firstConv.id,
          conversationData: firstConv,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setSelectedAnalysis(data);
        })
        .catch(console.error);
    }
  }, [conversations, selectedAnalysis]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Resumo IA</h1>
      
      {loading ? (
        <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200 text-center">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      ) : selectedAnalysis ? (
        <div className="space-y-6">
          {/* Next Action */}
          {selectedAnalysis.next_action && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h2 className="text-xl font-semibold text-blue-900 mb-2">Próxima Ação</h2>
                  <p className="text-blue-800">{selectedAnalysis.next_action}</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions Summary */}
          {selectedAnalysis.suggestions && selectedAnalysis.suggestions.length > 0 && (
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Sugestões ({selectedAnalysis.suggestions.length})
              </h2>
              <div className="space-y-3">
                {selectedAnalysis.suggestions.slice(0, 3).map((sug: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{sug.label}</h3>
                    <p className="text-gray-700 text-sm">{sug.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist Summary */}
          {selectedAnalysis.checklist && selectedAnalysis.checklist.length > 0 && (
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ListChecks className="w-6 h-6" />
                Checklist ({selectedAnalysis.checklist.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAnalysis.checklist.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      item.state === 'done'
                        ? 'bg-green-50 border-green-200'
                        : item.state === 'warn'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="font-medium capitalize">
                      {item.item.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Status: {item.state}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Output Info */}
          {selectedAnalysis.aiOutput && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Informações da IA
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Provider: {selectedAnalysis.aiOutput.provider || 'N/A'}</p>
                <p>Model: {selectedAnalysis.aiOutput.model || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl p-8 border border-gray-200">
          <p className="text-gray-600">
            Nenhuma análise disponível. Selecione uma conversa no menu lateral para ver os dados.
          </p>
        </div>
      )}
    </div>
  );
}