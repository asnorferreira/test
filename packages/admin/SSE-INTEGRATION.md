# Integração SSE no Frontend

## Como usar o hook useSSE

O hook `useSSE` está disponível em `packages/admin/app/hooks/useSSE.ts`.

### Exemplo básico:

```tsx
'use client';

import { useSSE } from '@/hooks/useSSE';

export function MyComponent() {
  const { isConnected, lastEvent } = useSSE({
    tenantId: 'demo',
    enabled: true,
    onEvent: (event) => {
      console.log('Evento recebido:', event);
      
      if (event.type === 'message:received') {
        // Nova mensagem recebida
        const { conversationId, messageId, text } = event.payload;
        // Atualizar UI
      }
      
      if (event.type === 'analysis:updated') {
        // Nova análise do N8N disponível
        const { conversationId, analysis } = event.payload;
        // Atualizar UI com sugestões/checklist
      }
    },
    onError: (error) => {
      console.error('Erro SSE:', error);
    },
    onConnect: () => {
      console.log('Conectado ao SSE');
    },
    onDisconnect: () => {
      console.log('Desconectado do SSE');
    },
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      {lastEvent && (
        <p>Último evento: {lastEvent.type}</p>
      )}
    </div>
  );
}
```

### Integrar com Sidebar existente

No componente `Sidebar.tsx`, adicione:

```tsx
import { useSSE } from '@/hooks/useSSE';

// Dentro do componente
const { isConnected, lastEvent } = useSSE({
  tenantId: 'demo',
  onEvent: (event) => {
    if (event.type === 'message:received') {
      // Atualizar lista de conversas
      refetchConversations();
    }
    if (event.type === 'analysis:updated') {
      // Atualizar análise da conversa atual
      const { conversationId, analysis } = event.payload;
      if (selectedConversationId === conversationId) {
        setAnalysis(analysis);
      }
    }
  },
});
```

## Variáveis de Ambiente

Adicione ao `.env.local` do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```


