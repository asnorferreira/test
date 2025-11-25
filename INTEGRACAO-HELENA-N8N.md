# Integração Helena-N8N-Backend-Frontend

## Resumo da Implementação

Sistema completo integrado para receber mensagens da Helena, processar via N8N, armazenar no banco e enviar atualizações em tempo real para o frontend.

## Arquitetura

```
Helena CRM
    ↓ (webhook ou polling)
Backend (Fastify)
    ↓ (HTTP POST)
N8N Workflow
    ↓ (HTTP POST)
Backend (/coach/webhook/suggestion)
    ↓ (salva no banco + broadcast)
Frontend (SSE)
```

## Componentes Criados

### Backend

1. **Schema Prisma** (`packages/server/src/db/schema.prisma`)
   - Conversation, Message, CoachAnalysis, HelenaWebhook

2. **Serviço Helena API** (`packages/server/src/services/helena-api.ts`)
   - Enviar mensagens via API Helena
   - Buscar mensagens (para polling)

3. **Serviço N8N** (`packages/server/src/services/n8n-service.ts`)
   - Chamar webhook do N8N com dados formatados

4. **Endpoint Webhook Helena** (`packages/server/src/routes/helena.ts`)
   - `POST /helena/webhook` - Receber eventos da Helena
   - Validação de `isFromMe` para evitar loops
   - Processamento assíncrono (fire-and-forget)

5. **Serviço Polling Helena** (`packages/server/src/services/helena-polling.ts`)
   - Fallback se webhook não funcionar
   - Polling configurável via .env

6. **Endpoint SSE** (`packages/server/src/routes/streaming.ts`)
   - `GET /api/stream/conversations` - Server-Sent Events
   - Broadcast de eventos em tempo real

7. **Endpoint Coach Atualizado** (`packages/server/src/routes/coach.ts`)
   - Salva análises no banco
   - Faz broadcast SSE para frontend

### Frontend

1. **Hook SSE** (`packages/admin/app/hooks/useSSE.ts`)
   - Conecta ao endpoint SSE
   - Reconexão automática
   - Callbacks para eventos

## Configuração

### Variáveis de Ambiente (.env)

```env
# Helena API
HELENA_API_URL=https://api.helena.run
HELENA_API_KEY=pn_AWZOGC6pEcYGHkCHdqrw26cDQbEmekcADVfuWqPoYM

# Helena Webhook
HELENA_WEBHOOK_ENABLED=true

# Helena Polling (fallback)
HELENA_POLLING_ENABLED=false
HELENA_POLLING_INTERVAL=5000

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/intermedius
SERVICE_TOKEN=8obwBQ6otGMiAhy3KJpty3gDKlDHaQ2jfxWUIKJXE3DJ5D7mLQZ0lXlZ7hyivRhB
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Migração do Banco

```bash
cd packages/server
npx prisma migrate dev --name init_helena_integration
```

Ou apenas gerar o cliente:

```bash
npx prisma generate
```

## Fluxo Completo

1. **Helena envia webhook** → `POST /helena/webhook`
2. **Backend valida** → Filtra `isFromMe=true`
3. **Backend salva** → Conversation + Message no banco
4. **Backend chama N8N** → `POST N8N_WEBHOOK_URL`
5. **N8N processa** → Analisa conversa com IA
6. **N8N retorna** → `POST /coach/webhook/suggestion`
7. **Backend salva análise** → CoachAnalysis no banco
8. **Backend faz broadcast** → SSE para frontend
9. **Frontend recebe** → Atualiza UI em tempo real

## Endpoints

- `POST /helena/webhook` - Receber eventos da Helena
- `POST /coach/webhook/suggestion` - Receber análises do N8N
- `GET /api/stream/conversations` - SSE para frontend

## Próximos Passos

1. Executar migração do banco de dados
2. Configurar webhook na Helena (se suportado)
3. Habilitar polling se webhook não funcionar
4. Integrar hook SSE no Sidebar do frontend
5. Testar fluxo completo end-to-end


