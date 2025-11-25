# Como Testar a Integração com N8N

## 🔍 Problema Identificado

O N8N só é chamado quando há uma **nova mensagem** recebida via webhook ou polling. Para testar ou analisar uma conversa existente, você precisa usar os endpoints de teste.

## ✅ Soluções Implementadas

### 1. Endpoint para Forçar Análise de Conversa Existente

**POST** `/coach/analyze/:conversationId`

Força a análise de uma conversa existente, mesmo sem nova mensagem.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/coach/analyze/6113d942-a2f5-4579-a42f-052209909783
```

### 2. Endpoint de Teste do N8N

**POST** `/test/n8n`

Testa a conexão com o N8N sem depender de conversas existentes.

**Exemplo:**
```bash
curl -X POST http://localhost:3000/test/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Olá, preciso de ajuda"
  }'
```

## 🔧 Verificações

### 1. Verificar se N8N está rodando

```bash
# Verificar se o N8N está acessível
curl http://localhost:5678/webhook/intermedius
```

Se retornar erro de conexão, o N8N não está rodando.

### 2. Verificar variáveis de ambiente

No arquivo `.env` do backend, verifique:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/intermedius
SERVICE_TOKEN=8obwBQ6otGMiAhy3KJpty3gDKlDHaQ2jfxWUIKJXE3DJ5D7mLQZ0lXlZ7hyivRhB
```

### 3. Verificar logs do backend

Quando o N8N é chamado, você deve ver logs como:

```
{"level":30,"msg":"Chamando webhook do N8N","n8nUrl":"http://localhost:5678/webhook/intermedius",...}
{"level":30,"msg":"Webhook N8N chamado com sucesso",...}
```

Se houver erro, você verá:

```
{"level":50,"msg":"Erro ao chamar webhook do N8N","error":"..."}
```

## 🐛 Debug

### Problema: N8N não está sendo chamado

**Possíveis causas:**
1. N8N não está rodando na porta 5678
2. URL do webhook está incorreta no `.env`
3. Não há novas mensagens (use o endpoint `/coach/analyze/:conversationId`)

**Solução:**
1. Verifique se o N8N está rodando: `curl http://localhost:5678`
2. Verifique a URL no `.env`: `N8N_WEBHOOK_URL=http://localhost:5678/webhook/intermedius`
3. Use o endpoint de teste: `POST /test/n8n`

### Problema: N8N recebe mas não retorna

**Possíveis causas:**
1. O workflow do N8N não está configurado para retornar ao backend
2. O endpoint de retorno está incorreto no N8N

**Solução:**
1. Verifique se o workflow do N8N tem um nó HTTP Request que chama:
   - URL: `http://localhost:3000/coach/webhook/suggestion`
   - Method: POST
   - Body: JSON com `conversationId`, `checklist`, `suggestions`, etc.

## 📝 Fluxo Completo

1. **Nova mensagem chega** → Backend recebe via webhook ou polling
2. **Backend chama N8N** → `POST http://localhost:5678/webhook/intermedius`
3. **N8N processa** → Analisa com IA e gera checklist/suggestions
4. **N8N retorna** → `POST http://localhost:3000/coach/webhook/suggestion`
5. **Backend salva** → Salva análise no banco e envia via SSE para frontend

## 🚀 Teste Rápido

```bash
# 1. Testar conexão com N8N
curl -X POST http://localhost:3000/test/n8n \
  -H "Content-Type: application/json" \
  -d '{"message": "Teste"}'

# 2. Forçar análise de conversa existente
curl -X POST http://localhost:3000/coach/analyze/6113d942-a2f5-4579-a42f-052209909783
```

## 📊 Verificar Logs

Os logs do backend mostrarão:
- ✅ Se o N8N foi chamado
- ✅ Qual URL foi usada
- ✅ Se houve erro na chamada
- ✅ Se a resposta foi recebida



