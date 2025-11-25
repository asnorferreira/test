'use client';

import { useEffect, useState } from 'preact/hooks';
import type { WidgetController, WidgetState } from './controller';

export function WidgetApp({ controller }: { controller: WidgetController }) {
  const [state, setState] = useState<WidgetState>(controller.state);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    return controller.subscribe(setState);
  }, [controller]);

  if (!state.ready) {
    return null;
  }

  const latest = state.suggestions[0];

  return (
    <div className="intermedius-coach-widget">
      <button className="ic-toggle" onClick={() => setIsOpen((value) => !value)}>
        Coach
      </button>
      {isOpen ? (
        <div className="ic-panel">
          <header className="ic-header">
            <div>
              <p className="ic-title">Assistente de Conversa</p>
              <p className="ic-subtitle">
                {state.conversationId
                  ? `Conversa ativa: ${state.conversationId}`
                  : 'Aguardando conversa. Use joinConversation.'}
              </p>
            </div>
          </header>

          {latest ? (
            <div className="ic-section">
              {latest.alert ? (
                <div className="ic-alert">{latest.alert}</div>
              ) : null}

              {latest.checklist && latest.checklist.length ? (
                <div className="ic-group">
                  <p className="ic-group-title">Checklist</p>
                  <ul className="ic-list">
                    {latest.checklist.map((item, index) => (
                      <li
                        key={`${item.name}-${index}`}
                        className={`ic-list-item ic-status-${item.status?.toLowerCase?.() ?? 'pending'}`}
                      >
                        <strong>{item.name}</strong>
                        {item.reason ? <span>{item.reason}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {latest.suggestions && latest.suggestions.length ? (
                <div className="ic-group">
                  <p className="ic-group-title">Sugestoes</p>
                  <ul className="ic-list">
                    {latest.suggestions.map((suggestion, index) => (
                      <li key={`${suggestion.content}-${index}`} className="ic-list-item">
                        <strong>{suggestion.type}</strong>
                        <span>{suggestion.content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="ic-empty-state">Nenhuma sugestao recebida ainda.</div>
          )}
        </div>
      ) : null}

      <style>
        {`
        .intermedius-coach-widget {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 99999;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .ic-toggle {
          border-radius: 9999px;
          padding: 8px 16px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #9333ea);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
          cursor: pointer;
        }
        .ic-panel {
          margin-top: 12px;
          width: 320px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15);
          border: 1px solid rgba(226, 232, 240, 0.8);
          overflow: hidden;
        }
        .ic-header {
          padding: 16px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(147, 51, 234, 0.9));
          color: #fff;
        }
        .ic-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .ic-subtitle {
          margin: 4px 0 0;
          font-size: 12px;
          opacity: 0.85;
        }
        .ic-section {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ic-alert {
          border-radius: 12px;
          background: rgba(220, 38, 38, 0.1);
          color: #b91c1c;
          padding: 12px;
          font-size: 13px;
        }
        .ic-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ic-group-title {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #0f172a;
          letter-spacing: 0.05em;
        }
        .ic-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ic-list-item {
          border-radius: 12px;
          padding: 10px;
          background: rgba(241, 245, 249, 0.7);
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #1e293b;
        }
        .ic-list-item strong {
          font-weight: 600;
        }
        .ic-status-completed {
          border-left: 3px solid #22c55e;
        }
        .ic-status-pending {
          border-left: 3px solid #f97316;
        }
        .ic-empty-state {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      `}
      </style>
    </div>
  );
}

