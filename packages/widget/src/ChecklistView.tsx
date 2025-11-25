import { h } from 'preact';
import { ChecklistItem } from './types';

interface ChecklistViewProps {
  items: ChecklistItem[];
  onItemToggle?: (index: number, item: ChecklistItem) => void;
}

export function ChecklistView({ items, onItemToggle }: ChecklistViewProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const completedCount = items.filter(item => item.done).length;
  const progressPercent = (completedCount / items.length) * 100;

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <h3 className="checklist-title">Checklist</h3>
        <span className="checklist-progress-text">
          {completedCount} / {items.length}
        </span>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="checklist-list">
        {items.map((item, index) => (
          <li
            key={index}
            onClick={() => onItemToggle?.(index, item)}
            className={`checklist-item ${item.done ? 'done' : ''}`}
          >
            <div className={`checkbox ${item.done ? 'checked' : 'unchecked'}`}>
              <span className="checkbox-icon">{item.done ? '✅' : '❌'}</span>
            </div>
            <span className="checklist-label">{item.label}</span>
          </li>
        ))}
      </ul>

      {completedCount === items.length && (
        <div className="checklist-complete">
          🎉 Checklist completa!
        </div>
      )}
    </div>
  );
}
