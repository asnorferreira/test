import { h } from 'preact';

interface BlockersAlertProps {
  blockers: string[];
  severity?: 'error' | 'warning';
  onBlockerClick?: (blocker: string, index: number) => void;
}

export function BlockersAlert({ 
  blockers, 
  severity = 'error',
  onBlockerClick 
}: BlockersAlertProps) {
  if (!blockers || blockers.length === 0) {
    return null;
  }

  const config = {
    error: { icon: '���' },
    warning: { icon: '⚠️' }
  };

  const style = config[severity];

  return (
    <div className="blockers-container">
      <div className="blockers-header">
        <div className="blockers-title-wrapper">
          <span className="blockers-icon">{style.icon}</span>
          <h3 className="blockers-title">Bloqueadores</h3>
        </div>
        <span className={`blockers-badge badge-${severity}`}>
          {blockers.length}
        </span>
      </div>

      <ul className="blockers-list">
        {blockers.map((blocker, index) => (
          <li
            key={index}
            onClick={() => onBlockerClick?.(blocker, index)}
            className={`blocker-item ${severity}`}
          >
            <div className={`blocker-indicator indicator-${severity}`}>!</div>
            <span className={`blocker-text text-${severity}`}>{blocker}</span>
          </li>
        ))}
      </ul>

      {blockers.length > 2 && (
        <div className={`blockers-alert alert-${severity}`}>
          ⚡ Atenção: Múltiplos bloqueadores detectados
        </div>
      )}
    </div>
  );
}
