import { h } from 'preact';

interface NextActionCardProps {
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export function NextActionCard({ action, priority }: NextActionCardProps) {
  const config = {
    high: { icon: 'í´´', label: 'Alta' },
    medium: { icon: 'í¿¡', label: 'MÃ©dia' },
    low: { icon: 'í¿¢', label: 'Baixa' }
  };

  const style = config[priority];

  return (
    <div className={`next-action-card priority-${priority}`}>
      <div className="action-header">
        <h3 className="action-title">
          <span>{style.icon}</span> PrÃ³xima AÃ§Ã£o
        </h3>
        <span className={`priority-badge badge-${priority}`}>
          {style.label}
        </span>
      </div>
      <p className={`action-text text-${priority}`}>
        {action}
      </p>
    </div>
  );
}
