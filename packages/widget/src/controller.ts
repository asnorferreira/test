export type ChecklistItem = {
  name: string;
  status: string;
  reason?: string;
};

export type SuggestionItem = {
  content: string;
  type: string;
};

export type SuggestionPayload = {
  analysisId?: string;
  alert?: string | null;
  checklist?: ChecklistItem[];
  suggestions?: SuggestionItem[];
};

export type WidgetState = {
  ready: boolean;
  conversationId: string | null;
  suggestions: SuggestionPayload[];
  lastUpdatedAt?: string;
};

type Listener = (state: WidgetState) => void;

export class WidgetController {
  private listeners = new Set<Listener>();
  private socket: import('socket.io-client').Socket | null = null;
  private pendingConversation?: string | null;
  state: WidgetState = { ready: false, conversationId: null, suggestions: [] };

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emitChange(partial: Partial<WidgetState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  async initialize(config: { apiBase: string }) {
    const { io } = await import('socket.io-client');
    this.socket = io(`${config.apiBase}/coach`, { transports: ['websocket'] });
    this.socket.on('connect', () => {
      this.emitChange({ ready: true });
      if (this.pendingConversation) {
        this.socket?.emit('joinConversation', this.pendingConversation);
      }
    });
    this.socket.on('newSuggestion', (payload: SuggestionPayload) => {
      this.emitChange({
        suggestions: [payload, ...this.state.suggestions].slice(0, 20),
        lastUpdatedAt: new Date().toISOString(),
      });
    });
  }

  joinConversation(conversationId: string) {
    this.pendingConversation = conversationId;
    if (this.socket?.connected) {
      this.socket.emit('joinConversation', conversationId);
    }
    this.emitChange({ conversationId, suggestions: [] });
  }

  reset() {
    this.pendingConversation = null;
    this.emitChange({ conversationId: null, suggestions: [] });
  }
}
