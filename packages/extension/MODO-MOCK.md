# 🎭 Modo MOCK da Extensão

## O que é?

O modo MOCK permite testar a extensão sem depender do backend ou N8N. Ele gera dados simulados (checklist e sugestões) e permite interagir com eles.

## ✅ Funcionalidades

### 1. Checklist Interativo
- **Clique nos itens** para mudar o status
- **Ciclo de estados**: `pendente` → `aviso` → `concluído` → `pendente`
- **Feedback visual**: Ícones mudam (⏳ → ⚠️ → ✅)
- **Toast notification**: Mostra o novo status ao clicar

### 2. Sugestões Funcionais
- **Botões clicáveis** para copiar sugestões
- **2 sugestões de exemplo** pré-configuradas

### 3. Ativação Automática
- Se a conexão com o backend falhar, o modo MOCK é ativado automaticamente
- Dados mockados são carregados imediatamente

## 🚀 Como Ativar

### Opção 1: Via Console do Navegador

1. Abra o Console (F12)
2. Execute:
```javascript
window.intermediusWidget.enableMock()
```
3. A página será recarregada automaticamente

### Opção 2: Via localStorage

1. Abra o Console (F12)
2. Execute:
```javascript
localStorage.setItem('intermedius_mock_mode', 'true');
location.reload();
```

### Opção 3: Automático

O modo MOCK é ativado automaticamente se:
- A conexão com o backend falhar
- O backend não estiver rodando
- Houver erro de CORS

## 🔧 Como Desativar

### Via Console:
```javascript
window.intermediusWidget.disableMock()
```

### Via localStorage:
```javascript
localStorage.setItem('intermedius_mock_mode', 'false');
location.reload();
```

## 📊 Dados Mockados

### Checklist (5 itens):
1. ✅ Verificar se o cliente mencionou o produto (done)
2. ⏳ Identificar necessidade específica (pending)
3. ⚠️ Validar orçamento disponível (warn)
4. ⏳ Confirmar prazo de entrega (pending)
5. ⏳ Apresentar proposta comercial (pending)

### Sugestões (2 opções):
1. **Proposta 1**: Apresentação Completa
2. **Proposta 2**: Agendamento de Reunião

## 🎮 Interação

### Checklist
- **Clique em qualquer item** para mudar o status
- O ícone muda automaticamente
- Uma notificação aparece mostrando o novo status

### Sugestões
- **Clique no botão** da sugestão
- O texto é copiado para a área de transferência
- Uma notificação confirma a cópia

## 🔍 Verificar Status

No console, execute:
```javascript
window.intermediusWidget.getStatus()
```

Retorna:
```javascript
{
  mockMode: true,           // Se está em modo MOCK
  conversationId: "mock-...", // ID da conversa
  backendUrl: "http://...",   // URL do backend
  hasPayload: true           // Se tem dados carregados
}
```

## 🛠️ Funções Disponíveis

### `window.intermediusWidget.enableMock()`
Ativa o modo MOCK e recarrega a página

### `window.intermediusWidget.disableMock()`
Desativa o modo MOCK e recarrega a página

### `window.intermediusWidget.loadMock()`
Carrega dados mockados sem recarregar a página

### `window.intermediusWidget.getStatus()`
Retorna o status atual do widget

## 📝 Notas

- O modo MOCK funciona **completamente offline**
- Não precisa do backend rodando
- Não precisa do N8N configurado
- Os dados são gerados localmente
- As interações são salvas apenas na sessão atual

## 🎯 Casos de Uso

1. **Desenvolvimento**: Testar a UI sem depender de APIs
2. **Demonstração**: Mostrar funcionalidades sem setup completo
3. **Debug**: Isolar problemas da extensão vs backend
4. **Testes**: Validar comportamento da interface



