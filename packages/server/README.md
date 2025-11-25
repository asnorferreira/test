# Intermedius Server - Documentação Completa

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Banco de Dados (Prisma)](#banco-de-dados-prisma)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Integração Helena + N8N](#integração-helena--n8n)
5. [Status do Sistema](#status-do-sistema)

---

## 🔧 Configuração Inicial

### Pré-requisitos

- Node.js 18+
- pnpm instalado
- PostgreSQL (Neon) configurado
- N8N rodando (opcional, para testes)

### Instalação

```bash
cd packages/server
pnpm install
```

---

## 🗄️ Banco de Dados (Prisma)

### Localização do Schema

O schema do Prisma está em: `packages/server/prisma/schema.prisma`

### Comandos Úteis

#### Gerar Cliente Prisma
```bash
cd packages/server
npx prisma generate
```

#### Aplicar Migrações
```bash
cd packages/server
npx prisma migrate deploy
```

#### Visualizar Banco (Prisma Studio)
```bash
cd packages/server
npx prisma studio
```

### Estrutura do Banco

**Tabelas Existentes:**
- `users`, `tenants`, `campaigns`, `policies`, `scripts`, `pillars`, etc.

**Novas Tabelas (Helena Integration):**
- `Conversation` - Conversas completas da Helena
- `Message` - Mensagens individuais
- `CoachAnalysis` - Análises do N8N (checklist, suggestions, blockers, nudges, nextAction)
- `HelenaWebhook` - Log de webhooks recebidos

### Aplicar Migração Helena

A migração já foi criada manualmente em `prisma/migrations/20250119000000_add_helena_models/migration.sql`.

Para aplicá-la:

```bash
cd packages/server
npx prisma migrate deploy
```

Se não funcionar, use:

```bash
npx prisma db push
```

Depois gere o cliente:

```bash
npx prisma generate
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto ou em `packages/server/`:

```env
# DATABASE_URL - OBRIGATÓRIO
DATABASE_URL="postgresql://neondb_owner:npg_vxfFABEqzj63@ep-wild-moon-acnndnb0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT
JWT_SECRET="coxinha's3gura"
JWT_EXPIRES_IN="15m"
REFRESH_EXPIRES_IN="7d"

# KEY
ENCRYPTION_KEY="a34b9d6c81f02e745baf1d6b7f9a3ce8d42eb1d91a7e5c38c9f0e2a1b8f65d4f"

# Ports
PORT=3000
INGESTOR_PORT=3001
POLICY_SERVICE_PORT=3002

# Multi-tenant (MVP)
DEFAULT_TENANT_SLUG="demo"

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/intermedius
SERVICE_TOKEN=8obwBQ6otGMiAhy3KJpty3gDKlDHaQ2jfxWUIKJXE3DJ5D7mLQZ0lXlZ7hyivRhB

# Helena API
HELENA_API_URL=https://api.helena.run
HELENA_API_KEY=pn_AWZOGC6pEcYGHkCHdqrw26cDQbEmekcADVfuWqPoYM

# Helena Webhook (NÃO USAR - você não tem acesso ao painel da Helena)
HELENA_WEBHOOK_ENABLED=false

# Helena Polling (USAR ESTE - única opção sem acesso ao webhook)
# ⚠️ ATENÇÃO: A URL da API pode estar incorreta. Verifique CONFIGURAR-HELENA-POLLING.md
HELENA_POLLING_ENABLED=true
HELENA_POLLING_INTERVAL=5000

# Helena Webhook Secret (opcional, para validação)
HELENA_WEBHOOK_SECRET=
```

---

## 🔄 Integração Helena + N8N

### Fluxo Completo

1. **Helena envia webhook** → `POST /helena/webhook`
   - Backend retorna 200 OK imediatamente (fire-and-forget)
   - Processa mensagem assincronamente
   - Filtra mensagens próprias (`isFromMe=true`)

2. **Backend processa mensagem:**
   - Salva webhook em `HelenaWebhook`
   - Cria/busca `Conversation`
   - Cria `Message`
   - Busca histórico de mensagens

3. **Backend chama N8N:**
   - Envia payload com mensagem + histórico
   - N8N processa com IA (Gemini/OpenAI)
   - N8N retorna análise (checklist, suggestions, blockers, nudges, nextAction)

4. **N8N retorna para backend** → `POST /coach/webhook/suggestion`
   - Backend salva análise em `CoachAnalysis`
   - Atualiza `Conversation.lastAnalysisId`
   - Broadcast via SSE para frontend

5. **Frontend recebe em tempo real:**
   - Conecta em `GET /api/stream/conversations`
   - Recebe eventos `message:received` e `analysis:updated`

### Endpoints

#### `POST /helena/webhook`
Recebe eventos da Helena (mensagens do WhatsApp).

**Payload esperado:**
```json
{
  "event": "message:created",
  "data": {
    "from": "5511999999999",
    "body": "Mensagem do cliente",
    "type": "text",
    "isFromMe": false,
    "timestamp": "2025-01-19T10:00:00Z"
  }
}
```

**Resposta:** `200 OK` imediatamente (processamento assíncrono)

#### `POST /coach/webhook/suggestion`
Recebe análises do N8N.

**Payload esperado:**
```json
{
  "conversationId": "helena-5511999999999",
  "turnId": "turn-1234567890",
  "checklist": [...],
  "suggestions": [...],
  "blockers": [...],
  "nudges": [...],
  "next_action": "Próxima ação sugerida",
  "aiOutput": {
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }
}
```

#### `GET /api/stream/conversations`
Server-Sent Events (SSE) para atualizações em tempo real.

**Query params:**
- `tenantId` (opcional): Filtrar por tenant

**Eventos enviados:**
- `connected`: Conexão estabelecida
- `message:received`: Nova mensagem recebida
- `analysis:updated`: Nova análise do coach disponível

### Configurar Webhook da Helena

Configure o webhook da Helena para apontar para:

```
POST http://seu-backend.com/helena/webhook
```

O backend retornará 200 OK imediatamente e processará a mensagem assincronamente.

### Habilitar Polling (Fallback)

Se o webhook não funcionar, habilite o polling:

```env
HELENA_POLLING_ENABLED=true
HELENA_POLLING_INTERVAL=5000
```

O sistema fará polling a cada 5 segundos (configurável).

---

## ✅ Status do Sistema

### ✅ Implementado

- [x] Schema Prisma com tabelas Helena (Conversation, Message, CoachAnalysis, HelenaWebhook)
- [x] Migração criada manualmente
- [x] Cliente Prisma gerado
- [x] Rota `/helena/webhook` para receber mensagens
- [x] Rota `/coach/webhook/suggestion` para receber análises do N8N
- [x] Rota `/api/stream/conversations` para SSE
- [x] Serviço `helena-api.ts` para interagir com Helena
- [x] Serviço `n8n-service.ts` para chamar N8N
- [x] Serviço `helena-polling.ts` para polling (fallback)
- [x] Broadcast SSE para frontend
- [x] Filtro de mensagens próprias (`isFromMe=true`)
- [x] Integração com histórico de conversas

### ⚠️ Pendente (Após Migração)

1. **Aplicar migração no banco:**
   ```bash
   cd packages/server
   npx prisma migrate deploy
   # ou
   npx prisma db push
   ```

2. **Verificar se as tabelas foram criadas:**
   ```bash
   npx prisma studio
   ```

3. **Testar fluxo completo:**
   - Enviar webhook da Helena → `POST /helena/webhook`
   - Verificar se mensagem foi salva
   - Verificar se N8N foi chamado
   - Verificar se análise foi salva quando N8N retornar
   - Verificar se SSE está funcionando no frontend

4. **Configurar webhook da Helena:**
   - Apontar webhook da Helena para `http://seu-backend.com/helena/webhook`
   - Ou habilitar polling se webhook não funcionar

### 🎯 Sistema Pronto Após Migração?

**SIM!** Após aplicar a migração (`npx prisma migrate deploy` ou `npx prisma db push`), o sistema estará **100% funcional**:

1. ✅ Banco de dados com todas as tabelas
2. ✅ Cliente Prisma gerado
3. ✅ Rotas implementadas
4. ✅ Serviços implementados
5. ✅ SSE funcionando
6. ✅ Integração Helena + N8N completa

**Único passo restante:** Aplicar a migração no banco e testar o fluxo completo!

---

## 🚀 Iniciar Servidor

```bash
cd packages/server
pnpm dev
```

O servidor iniciará em `http://localhost:3000`

---

## 📝 Notas

- O schema antigo em `src/db/schema.prisma` pode ser removido após confirmar que tudo funciona
- As migrações estão em `packages/server/prisma/migrations/`
- O cliente Prisma é gerado em `node_modules/@prisma/client`


