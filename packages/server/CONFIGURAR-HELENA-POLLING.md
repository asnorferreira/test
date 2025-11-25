# 🔧 Configurar Polling da Helena (Sem Acesso ao Webhook)

## Situação Atual

Você **NÃO tem acesso ao painel da Helena** para configurar webhooks, então vamos usar **POLLING** para buscar mensagens.

## ⚠️ Erro Atual

O erro `"ERROR: Incorrect URL - InternalPort:8001"` indica que:
- A URL da API pode estar incorreta
- O endpoint pode não existir
- A API pode precisar de uma URL diferente

## 🔍 Como Descobrir a URL Correta

### Opção 1: Verificar Documentação da Helena
- Consulte a documentação oficial da Helena
- Procure pelo endpoint de mensagens
- Pode ser algo como:
  - `https://api.helena.run/v1/messages` (sem `/api`)
  - `https://helena.run/api/messages` (sem `/v1`)
  - `https://api.helena.run/messages` (sem `/api/v1`)

### Opção 2: Testar Diferentes URLs

Edite o `.env` e teste diferentes URLs:

```env
# Tentativa 1 (atual - não funciona)
HELENA_API_URL=https://api.helena.run

# Tentativa 2
HELENA_API_URL=https://api.helena.run/v1

# Tentativa 3
HELENA_API_URL=https://helena.run/api

# Tentativa 4
HELENA_API_URL=https://helena.run
```

E ajuste o endpoint no código se necessário.

### Opção 3: Contatar Suporte da Helena
- Entre em contato com o suporte da Helena
- Pergunte qual é a URL correta da API para buscar mensagens
- Pergunte qual é o endpoint correto

## 📝 Configuração Atual

No `.env`:

```env
# Helena API
HELENA_API_URL=https://api.helena.run
HELENA_API_KEY=pn_AWZOGC6pEcYGHkCHdqrw26cDQbEmekcADVfuWqPoYM

# Helena Webhook (não será usado - você não tem acesso)
HELENA_WEBHOOK_ENABLED=false

# Helena Polling (USAR ESTE - única opção sem acesso ao webhook)
HELENA_POLLING_ENABLED=true
HELENA_POLLING_INTERVAL=5000
```

## 🧪 Testar

1. Configure `HELENA_POLLING_ENABLED=true` no `.env`
2. Reinicie o backend
3. Verifique os logs:
   - Se funcionar: `"Mensagens encontradas via polling"`
   - Se não funcionar: `"API da Helena retornou erro de URL incorreta"`

## 🔄 Endpoints Testados

O código atual tenta buscar em:
- `GET ${HELENA_API_URL}/api/v1/messages`

Se a URL correta for diferente, precisamos ajustar o código em:
- `packages/server/src/services/helena-api.ts` (linha 130)

## ✅ Quando Funcionar

Quando o polling estiver funcionando, você verá:
- Logs de mensagens encontradas
- Mensagens sendo salvas no banco
- N8N sendo chamado automaticamente
- Frontend recebendo atualizações via SSE

## 🚫 Se Não Funcionar

Se mesmo com a URL correta não funcionar:
1. Verifique se a `HELENA_API_KEY` está correta
2. Verifique se a API da Helena suporta polling (algumas APIs só têm webhook)
3. Considere usar um serviço de túnel (ngrok) para receber webhooks mesmo sem acesso ao painel

