# 🚀 Setup Completo - Intermedius Coach System

Scripts PowerShell para configurar e gerenciar todo o sistema Intermedius Coach.

## 📋 Pré-requisitos

- **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- **PowerShell** (v5.1 ou superior - já vem com Windows)
- **Git** (opcional, para clonar o repositório)

## 🎯 Scripts Disponíveis

### 1. `setup-all.ps1` - Setup Completo

Configura e inicia todos os serviços do sistema.

**Uso básico:**
```powershell
.\setup-all.ps1
```

**Opções disponíveis:**
```powershell
# Pular instalação de dependências (se já instaladas)
.\setup-all.ps1 -SkipInstall

# Pular N8N (se não quiser iniciar o N8N)
.\setup-all.ps1 -SkipN8N

# Pular verificação de saúde dos serviços
.\setup-all.ps1 -SkipChecks

# Especificar caminho do N8N (se não estiver no PATH)
.\setup-all.ps1 -N8NPath "C:\Users\Usuario\AppData\Roaming\npm\n8n.cmd"

# Personalizar portas
.\setup-all.ps1 -AdminPort 3001 -ApiGatewayPort 3000 -PolicyServicePort 3002 -N8NPort 5678
```

**O que o script faz:**
1. ✅ Verifica dependências (Node.js, pnpm)
2. ✅ Instala pnpm se necessário
3. ✅ Instala todas as dependências do projeto
4. ✅ Cria arquivos `.env` com configurações padrão
5. ✅ Prepara banco de dados (Prisma)
6. ✅ Verifica portas disponíveis
7. ✅ Inicia todos os serviços em background
8. ✅ Verifica saúde dos serviços

### 2. `stop-all.ps1` - Parar Todos os Serviços

Para todos os processos Node.js relacionados ao projeto.

**Uso:**
```powershell
.\stop-all.ps1
```

### 3. `status-all.ps1` - Verificar Status

Verifica o status de todos os serviços e mostra informações detalhadas.

**Uso:**
```powershell
.\status-all.ps1
```

## 🏃 Início Rápido

### Primeira vez:

```powershell
# 1. Execute o setup completo
.\setup-all.ps1

# 2. Aguarde alguns segundos para os serviços iniciarem

# 3. Verifique o status
.\status-all.ps1

# 4. Importe o workflow N8N
#    - Abra: http://localhost:5678
#    - Importe: n8n-Fluxo-intermedius.json

# 5. Configure variáveis de ambiente no N8N
#    - Settings > Environment Variables
#    - Adicione: GOOGLE_GEMINI_API_KEY (opcional, já configurado no workflow)
```

### Próximas vezes:

```powershell
# Se já configurou tudo antes, pode pular instalação
.\setup-all.ps1 -SkipInstall

# Ou apenas iniciar os serviços normalmente
.\setup-all.ps1
```

## 🌐 URLs dos Serviços

Após iniciar, os serviços estarão disponíveis em:

- **Admin Panel**: http://localhost:3001
- **API Gateway**: http://localhost:3000
- **Policy Service**: http://localhost:3002
- **N8N Workflow**: http://localhost:5678

## ⚙️ Configuração

### Variáveis de Ambiente

O script cria automaticamente arquivos `.env` com valores padrão. Você pode editá-los:

**Raiz do projeto (`.env`):**
```env
SERVICE_TOKEN=seu-token-aqui
API_GATEWAY_PORT=3000
POLICY_SERVICE_PORT=3002
N8N_WEBHOOK_URL=http://localhost:5678/webhook/intermedius
GOOGLE_GEMINI_API_KEY=AIzaSyBBd2nowM3sOOYgP0NBV_t9zsfKjMuqgBQ
GOOGLE_GEMINI_MODEL=gemini-pro
DATABASE_URL=postgresql://user:password@localhost:5432/intermedius
```

**Admin Panel (`packages/admin/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
N8N_WEBHOOK_URL=http://localhost:5678/webhook/intermedius
SERVICE_TOKEN=seu-token-aqui
```

### Portas Personalizadas

Se precisar usar portas diferentes, edite os arquivos `.env` ou use os parâmetros do script:

```powershell
.\setup-all.ps1 -AdminPort 3001 -ApiGatewayPort 3000 -PolicyServicePort 3002 -N8NPort 5678
```

## 🔧 Troubleshooting

### Porta já em uso

Se uma porta estiver em uso, o script avisará. Você pode:

1. Parar o serviço que está usando a porta:
   ```powershell
   .\stop-all.ps1
   ```

2. Ou usar uma porta diferente:
   ```powershell
   .\setup-all.ps1 -AdminPort 3002
   ```

### Serviço não inicia

1. Verifique os logs na pasta `logs/` (se existir)
2. Verifique se as portas estão livres:
   ```powershell
   .\status-all.ps1
   ```
3. Verifique se as variáveis de ambiente estão corretas
4. Tente reinstalar dependências:
   ```powershell
   .\setup-all.ps1
   ```

### N8N não encontrado

Se o N8N não estiver instalado globalmente:

1. Instale o N8N:
   ```powershell
   npm install -g n8n
   ```

2. Ou forneça o caminho:
   ```powershell
   .\setup-all.ps1 -N8NPath "C:\caminho\para\n8n.cmd"
   ```

### Erro de permissão

Se encontrar erros de permissão:

1. Execute o PowerShell como Administrador
2. Ou ajuste a política de execução:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 📝 Próximos Passos Após Setup

1. **Importar Workflow N8N:**
   - Acesse http://localhost:5678
   - Vá em "Workflows" > "Import from File"
   - Selecione `n8n-Fluxo-intermedius.json`
   - Ative o workflow

2. **Configurar N8N:**
   - Settings > Environment Variables
   - Adicione: `GOOGLE_GEMINI_API_KEY` com sua chave (opcional, já configurado no workflow)
   - Adicione: `SERVICE_TOKEN` se necessário

3. **Testar API Gateway:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
   ```

4. **Testar Policy Service:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3002/health" -Method GET -Headers @{"X-Service-Token"="seu-token"}
   ```

5. **Testar N8N Webhook:**
   ```powershell
   $body = @{
       id = "test-123"
       text = "Mensagem de teste"
       author = "cliente"
       metadata = @{
           campaignId = "982b0125-9dd1-497c-8134-4f6fb60d3e76"
           conversationId = "test-conv"
       }
   } | ConvertTo-Json

   Invoke-WebRequest -Uri "http://localhost:5678/webhook/intermedius" -Method POST -Body $body -ContentType "application/json" -Headers @{"X-Service-Token"="seu-token"}
   ```

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o status: `.\status-all.ps1`
2. Pare todos os serviços: `.\stop-all.ps1`
3. Execute o setup novamente: `.\setup-all.ps1`
4. Verifique os logs (se existirem na pasta `logs/`)

## 📚 Estrutura do Projeto

```
intermediusDois_FernandoArruda/
├── setup-all.ps1          # Script principal de setup
├── stop-all.ps1           # Script para parar serviços
├── status-all.ps1         # Script para verificar status
├── packages/
│   ├── admin/             # Admin Panel (Next.js)
│   ├── server/            # API Gateway + Services
│   └── widget/            # Widget de coaching
└── n8n-Fluxo-intermedius.json  # Workflow N8N
```

---

**Desenvolvido para Intermedius Coach System** 🚀

