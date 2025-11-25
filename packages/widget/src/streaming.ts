import { CoachData } from './types';

export class StreamingClient {
  private eventSource: EventSource | null = null;
  private conversationId: string | null = null;
  private baseUrl: string;
  private onMessageCallback: ((data: CoachData) => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  connect(conversationId: string) {
    // Fecha conexão anterior se existir
    this.disconnect();

    this.conversationId = conversationId;
    const url = `${this.baseUrl}/stream/${conversationId}`;

    console.log('[Streaming] Conectando ao:', url);

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('[Streaming] Conexão aberta');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Streaming] Mensagem recebida:', data);
        
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (err) {
        console.error('[Streaming] Erro ao parsear mensagem:', err);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('[Streaming] Erro na conexão:', error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }

      // Reconectar após 3 segundos
      setTimeout(() => {
        if (this.conversationId) {
          console.log('[Streaming] Tentando reconectar...');
          this.connect(this.conversationId);
        }
      }, 3000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      console.log('[Streaming] Fechando conexão');
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  onMessage(callback: (data: CoachData) => void) {
    this.onMessageCallback = callback;
  }

  onError(callback: (error: Event) => void) {
    this.onErrorCallback = callback;
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}
