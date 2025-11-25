'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SSEEvent {
  type: string;
  payload: any;
}

export interface UseSSEOptions {
  tenantId?: string;
  enabled?: boolean;
  onEvent?: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSSE(options: UseSSEOptions = {}) {
  const {
    tenantId,
    enabled = true,
    onEvent,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 segundos

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Fechar conexão existente se houver
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Limpar timeout de reconexão
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      // Construir URL do SSE
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = new URL(`${baseUrl}/api/stream/conversations`);
      if (tenantId) {
        url.searchParams.append('tenantId', tenantId);
      }

      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEEvent;
          setLastEvent(data);
          onEvent?.(data);
        } catch (error) {
          console.error('Erro ao parsear evento SSE:', error);
        }
      };

      eventSource.onerror = (error) => {
        setIsConnected(false);
        eventSource.close();

        // Tentar reconectar
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        } else {
          onError?.(new Error('Falha ao conectar após múltiplas tentativas'));
          onDisconnect?.();
        }
      };
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Erro desconhecido'));
    }
  }, [enabled, tenantId, onEvent, onError, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
    onDisconnect?.();
  }, [onDisconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
  };
}


