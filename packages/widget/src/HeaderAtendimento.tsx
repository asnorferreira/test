import { h } from 'preact';

interface HeaderAtendimentoProps {
  client_name: string;
  client_status?: 'online' | 'offline' | 'away';
  conversation_id: string;
  start_time: string;
}

export function HeaderAtendimento({ 
  client_name, 
  client_status = 'online', 
  conversation_id, 
  start_time 
}: HeaderAtendimentoProps) {
  return (
    <div className="header-atendimento">
      <h2 className="header-title">
        <span className={`status-indicator status-${client_status}`} />
        {client_name}
      </h2>
      <div className="header-info">
        <div className="info-item">
          <span className="info-label">ID:</span>
          <span>{conversation_id}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Início:</span>
          <span>{start_time}</span>
        </div>
      </div>
    </div>
  );
}
