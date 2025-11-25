<!-- 3ffea523-c594-4621-9290-efbaae66238c cb542656-4164-4eea-bf52-74988ef0def4 -->
# Menu Lateral e Melhorias N8N

## Problemas Identificados

1. **Fluxo N8N (`n8n-Fluxo-intermedius.json`)**:

   - Usa múltiplos nodes IF ao invés de Switch para rotear IA
   - "Verificar Fallback" envia para "Processar Apenas Regras" em ambos os caminhos (bug)
   - "Preparar Resposta Final" retorna apenas contadores, não os dados completos (suggestions, checklist)
   - Parsing da resposta da IA pode não estar preservando dados originais corretamente

2. **Menu Lateral (`packages/admin/app/components/Sidebar.tsx`)**:

   - Atualmente apenas navegação estática
   - Precisa funcionar como extensão para buscar conversas
   - Precisa exibir sugestões e checklist dos dados retornados do N8N

## Implementação

### 1. Melhorar Fluxo N8N

**Arquivo**: `n8n-Fluxo-intermedius.json`

- **Substituir múltiplos IF nodes por Switch node**:
  - Remover nodes: "IF OpenAI", "IF Anthropic", "IF Helena", "IF Gemini", "IF Sem IA"
  - Criar node "Switch AI Provider" com condições:
    - `$json.aiProvider === 'openai'` → "Chamar OpenAI"
    - `$json.aiProvider === 'anthropic'` → "Chamar Anthropic"
    - `$json.aiProvider === 'helena'` → "Chamar Helena"
    - `$json.aiProvider === 'gemini'` → "Chamar Gemini"
    - `$json.useAI === false` → "Processar Apenas Regras"
    - Default → "Processar Apenas Regras"

- **Corrigir "Verificar Fallback"**:
  - Quando `fallbackToRules === false` → deve ir para node de parsing (criar "Parse Resposta Completo")
  - Quando `fallbackToRules === true` → "Processar Apenas Regras"

- **Melhorar "Processar Apenas Regras"**:
  - Garantir que preserve dados originais (prompt, metadata, turnId, conversationId)
  - Garantir formato correto de suggestions (label, text) e checklist (item, state)

- **Criar/Corrigir "Parse Resposta Completo"**:
  - Parsear resposta da IA preservando todos os dados originais
  - Extrair suggestions e checklist corretamente de diferentes formatos (OpenAI, Anthropic, Google, Helena)
  - Garantir que turnId e conversationId estejam presentes

- **Corrigir "Preparar Resposta Final"**:
  - Incluir `suggestions` e `checklist` completos no nível raiz da resposta
  - Incluir também em `aiOutput.analysis` para compatibilidade
  - Garantir que `turnId` esteja presente

### 2. Criar Menu Lateral como Extensão

**Arquivo**: `packages/admin/app/components/Sidebar.tsx`

- **Adicionar funcionalidade de busca de conversas de sistema externo**:
  - Criar estado para lista de conversas
  - Criar função/prop para buscar conversas de sistema externo (WhatsApp, etc.)
  - Adicionar input de busca/filtro
  - Suportar múltiplas fontes de dados (extensível)

- **Adicionar modal/popup para exibir sugestões e checklist**:
  - Quando conversa clicada, abrir modal/popup
  - Buscar dados do N8N (via API backend) para a conversa selecionada
  - Exibir sugestões em cards/listas dentro do modal
  - Exibir checklist com estados (done, pending, warn) no modal
  - Adicionar botão de fechar e navegação entre conversas no modal

- **Tornar extensível e nativo**:
  - Criar interface/prop para receber callback de busca de conversas de sistema externo
  - Permitir injeção de função customizada para buscar dados de qualquer sistema
  - Manter funcionalidade nativa para uso interno
  - Exportar componente para uso em outros sistemas como extensão
  - Criar hook/context para gerenciar estado de conversas

### 3. Criar API/Service para Integração N8N

**Arquivo**: `packages/admin/app/api/conversations/route.ts` (novo)

- Criar endpoint para buscar conversas
- Criar endpoint para buscar dados de uma conversa específica (chama N8N)
- Retornar dados formatados (suggestions, checklist) para o frontend

### 4. Atualizar Páginas Existentes

**Arquivos**:

- `packages/admin/app/ai-summary/page.tsx`
- `packages/admin/app/checklists/page.tsx`

- Integrar com menu lateral para exibir dados
- Usar dados retornados do N8N para popular páginas

## Estrutura de Dados Esperada

Resposta do N8N deve incluir:

```json
{
  "success": true,
  "conversationId": "...",
  "turnId": "...",
  "suggestions": [...],  // Array completo
  "checklist": [...],    // Array completo
  "blockers": [...],
  "nudges": [...],
  "next_action": "...",
  "aiOutput": {
    "analysis": {
      "suggestions": [...],
      "checklist": [...]
    }
  }
}
```

## Notas

- O fluxo N8N atual tem conexões incorretas que precisam ser corrigidas
- O parsing precisa preservar dados originais para garantir que turnId e conversationId não se percam
- O menu lateral deve ser reativo e atualizar quando novos dados chegarem