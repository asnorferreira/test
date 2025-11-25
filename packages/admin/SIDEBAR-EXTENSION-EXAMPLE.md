# Como Usar o Sidebar como Extensão

O componente `Sidebar` foi projetado para funcionar tanto como componente nativo quanto como extensão para sistemas externos.

## Uso Nativo

O Sidebar funciona automaticamente sem configuração adicional:

```tsx
import { Sidebar } from './components/Sidebar';

export default function Layout() {
  return <Sidebar />;
}
```

## Uso como Extensão

Para integrar com um sistema externo (WhatsApp, etc.), passe uma função customizada:

```tsx
import { Sidebar } from './components/Sidebar';

// Exemplo: Buscar conversas de sistema externo
async function fetchConversationsFromWhatsApp() {
  // Sua lógica para buscar conversas do WhatsApp
  const response = await fetch('https://seu-sistema-whatsapp.com/api/conversations', {
    headers: {
      'Authorization': 'Bearer seu-token',
    },
  });
  
  const data = await response.json();
  
  // Formatar para o formato esperado
  return data.conversations.map((conv: any) => ({
    id: conv.id,
    conversationId: conv.conversationId || conv.id,
    text: conv.lastMessage?.text || '',
    author: conv.lastMessage?.from || 'cliente',
    timestamp: conv.lastMessage?.timestamp || new Date().toISOString(),
    metadata: {
      conversationId: conv.conversationId || conv.id,
      channel: 'whatsapp',
      clientName: conv.contact?.name || 'Cliente',
      agentName: conv.assignedTo?.name || 'Agente',
      campaignId: conv.campaignId,
    },
  }));
}

export default function Layout() {
  return (
    <Sidebar onFetchConversations={fetchConversationsFromWhatsApp} />
  );
}
```

## Estrutura de Dados Esperada

A função `onFetchConversations` deve retornar um array de objetos com a seguinte estrutura:

```typescript
interface Conversation {
  id: string;
  conversationId: string;
  text?: string;
  author?: string;
  timestamp?: string;
  metadata?: {
    conversationId?: string;
    turnId?: string;
    campaignId?: string;
    channel?: string;
    agentName?: string;
    clientName?: string;
    [key: string]: any;
  };
}
```

## Como Funciona

1. **Busca de Conversas**: O Sidebar chama `onFetchConversations()` (se fornecido) ou usa a API padrão `/api/conversations`
2. **Análise via N8N**: Quando uma conversa é clicada, o Sidebar envia os dados para o N8N via `/api/conversations` (POST)
3. **Exibição em Modal**: Os dados retornados do N8N (suggestions, checklist) são exibidos em um modal

## Variáveis de Ambiente Necessárias

Certifique-se de configurar no `.env`:

```
N8N_WEBHOOK_URL=http://localhost:5678/webhook/intermedius
SERVICE_TOKEN=seu-service-token
```

