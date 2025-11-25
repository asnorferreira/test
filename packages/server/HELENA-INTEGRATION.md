# 🔄 Integração com Helena - Como Funciona

## O que é a Helena?

**Helena é um serviço externo** (API de WhatsApp) - **NÃO precisa instalar nada!**

É como usar a API do WhatsApp Business ou Twilio - você só precisa:
1. Ter uma conta na Helena
2. Configurar o webhook para apontar para seu backend
3. Usar a API Key no `.env`

## ✅ Status Atual

**TUDO JÁ ESTÁ IMPLEMENTADO NO BACKEND!**

- ✅ Rota `/helena/webhook` - Recebe mensagens da Helena
- ✅ Serviço `helena-api.ts` - Envia mensagens via API Helena
- ✅ Serviço `helena-polling.ts` - Polling (fallback se webhook não funcionar)
- ✅ Filtro de mensagens próprias (`isFromMe=true`)
- ✅ Integração com N8N
- ✅ Persistência no banco

## 🎯 Como Funciona

### Opção 1: Webhook (Recomendado) ✅

1. **Helena envia webhook** → `POST http://seu-backend.com/helena/webhook`
2. **Backend recebe** → Salva mensagem → Chama N8N → Salva análise
3. **Configuração**: No painel da Helena, configure o webhook para apontar para seu backend

**Status**: `HELENA_WEBHOOK_ENABLED=true` (já configurado no `.env`)

### Opção 2: Polling (Fallback)

Se o webhook não funcionar, habilite o polling:

```env
HELENA_POLLING_ENABLED=true
HELENA_POLLING_INTERVAL=5000
```

O backend fará polling a cada 5 segundos buscando novas mensagens.

**Status atual**: `HELENA_POLLING_ENABLED=false` (desabilitado porque webhook é preferível)

## 📋 Configuração Necessária

### 1. Variáveis de Ambiente (já no `.env`)

```env
HELENA_API_URL=https://api.helena.run
HELENA_API_KEY=pn_AWZOGC6pEcYGHkCHdqrw26cDQbEmekcADVfuWqPoYM
HELENA_WEBHOOK_ENABLED=true
HELENA_POLLING_ENABLED=false
```

### 2. Configurar Webhook na Helena

No painel da Helena, configure o webhook para:

```
POST http://seu-backend.com/helena/webhook
```

Ou se estiver testando localmente, use um túnel (ngrok, localtunnel, etc.):

```
POST https://seu-tunel.ngrok.io/helena/webhook
```

## 🧪 Testar

### Testar Webhook Manualmente

```bash
curl -X POST http://localhost:3000/helena/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message:created",
    "data": {
      "from": "5511999999999",
      "body": "Olá, preciso de ajuda",
      "type": "text",
      "isFromMe": false,
      "timestamp": "2025-01-19T10:00:00Z"
    }
  }'
```

### Verificar no Banco

```bash
cd packages/server
npx prisma studio
```

Verifique as tabelas:
- `HelenaWebhook` - Webhooks recebidos
- `Conversation` - Conversas criadas
- `Message` - Mensagens salvas
- `CoachAnalysis` - Análises do N8N

## ✅ Está Funcionando?

**SIM!** O log `"Polling da Helena desabilitado"` é **NORMAL** e **CORRETO**:

- Significa que o polling está desabilitado (como configurado)
- O sistema está usando webhooks (preferível)
- Quando a Helena enviar um webhook, o backend vai receber e processar

## 🚀 Próximos Passos

1. **Configurar webhook na Helena** para apontar para seu backend
2. **Testar** enviando uma mensagem via WhatsApp conectado à Helena
3. **Verificar** se a mensagem foi salva e o N8N foi chamado

**Não precisa instalar nada - está tudo pronto!** 🎉


