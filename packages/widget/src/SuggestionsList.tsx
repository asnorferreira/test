import { h } from 'preact';
import { useState } from 'preact/hooks';

interface SuggestionsListProps {
  suggestions: string[];
  onSuggestionClick?: (suggestion: string, index: number) => void;
}

export function SuggestionsList({ suggestions, onSuggestionClick }: SuggestionsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const handleCopy = async (suggestion: string, index: number, e: MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      
      // Remove o feedback visual após 2 segundos
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
      
      console.log('[Coach Panel] Sugestão copiada:', suggestion);
    } catch (err) {
      console.error('[Coach Panel] Erro ao copiar:', err);
    }
  };

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        <h3 className="suggestions-title">Sugestões IA</h3>
        <span className="suggestions-badge">{suggestions.length}</span>
      </div>
      <ul className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            onClick={() => onSuggestionClick?.(suggestion, index)}
            className="suggestion-item"
          >
            <span className="suggestion-text">{suggestion}</span>
            <button
              onClick={(e) => handleCopy(suggestion, index, e)}
              className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
              title="Copiar texto"
            >
              {copiedIndex === index ? '✓' : '📋'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
