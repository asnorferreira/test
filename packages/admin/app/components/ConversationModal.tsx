'use client';

import { X, CheckCircle2, Clock, AlertCircle, Lightbulb, ListChecks } from 'lucide-react';
import { cn } from '../utils/cn';

interface ChecklistItem {
  item: string;
  state: string;
  score?: number | null;
  notes?: string | null;
  evidence?: any;
}

interface Suggestion {
  label: string;
  text: string;
  priority?: string;
}

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  checklist: ChecklistItem[];
  suggestions: Suggestion[];
  blockers: any[];
  nudges: any[];
  next_action?: string | null;
  aiOutput?: any;
}

export function ConversationModal({
  isOpen,
  onClose,
  conversationId,
  checklist,
  suggestions,
  blockers,
  nudges,
  next_action,
  aiOutput,
}: ConversationModalProps) {
  if (!isOpen) return null;

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
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Análise da Conversa</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {conversationId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Next Action */}
          {next_action && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Próxima Ação</h3>
                  <p className="text-blue-800">{next_action}</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Sugestões ({suggestions.length})
              </h3>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {suggestion.label}
                        </h4>
                        <p className="text-gray-700">{suggestion.text}</p>
                      </div>
                      {suggestion.priority && (
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            suggestion.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : suggestion.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {suggestion.priority}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ListChecks className="w-5 h-5" />
                Checklist ({checklist.length})
              </h3>
              <div className="space-y-2">
                {checklist.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'border rounded-lg p-4 flex items-start gap-3',
                      getStateColor(item.state)
                    )}
                  >
                    {getStateIcon(item.state)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium capitalize">
                          {item.item.replace(/_/g, ' ')}
                        </h4>
                        {item.score !== null && item.score !== undefined && (
                          <span className="text-sm font-medium">
                            Score: {item.score}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm mt-1 opacity-90">{item.notes}</p>
                      )}
                      {item.evidence && item.evidence.excerpt && (
                        <p className="text-xs mt-2 italic opacity-75">
                          Evidência: "{item.evidence.excerpt}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockers */}
          {blockers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Bloqueadores ({blockers.length})
              </h3>
              <div className="space-y-2">
                {blockers.map((blocker, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <p className="text-red-800">
                      {blocker.message || blocker.code || JSON.stringify(blocker)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nudges */}
          {nudges.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Alertas ({nudges.length})
              </h3>
              <div className="space-y-2">
                {nudges.map((nudge, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <p className="text-yellow-800">
                      {nudge.message || nudge.code || JSON.stringify(nudge)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Output Info */}
          {aiOutput && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Informações da IA
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Provider: {aiOutput.provider || 'N/A'}</p>
                <p>Model: {aiOutput.model || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && checklist.length === 0 && !next_action && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum dado disponível para esta conversa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

