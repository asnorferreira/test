# Pendências — Fluxo de Checkout Pagar.me

Documento de acompanhamento do que ficou pronto e o que ainda falta para o fluxo de carrinho/checkout com Pagar.me estar 100% em produção.

> Última atualização: 2026-04-12

---

## ✅ Já entregue

### Backend (NestJS + Prisma)
- Schema `Order` com endereço de entrega, farmácia parceira e metadata do gateway
- Módulo **Shipping** (`POST /shipping/quote`) com ViaCEP + tabela regional PAC/SEDEX
- Módulo **Pharmacies** (`GET /pharmacies`) mockado
- Gateway **Pagar.me real** (Orders API v5, cartão + PIX, fallback mock se sem API key)
- Guard de **prescrição ativa** no `OrderService.create` (bloqueia sem prescrição ACTIVE, expirada ou de outro user)
- Endpoint `GET /prescriptions/me` para paciente consultar suas prescrições ativas
- `.env.example` do `apps/api` atualizado com `PAGARME_API_URL`, `PAGARME_WEBHOOK_SECRET`, `VIACEP_API_URL`, `SHIPPING_ORIGIN_ZIPCODE`
- **58 testes passando** (22 suites) incluindo os novos: shipping, pharmacy, pagarme gateway e order service refatorado

### Frontend (Next.js)
- `api-client.ts` real (fetch + Bearer + `ApiError`)
- `auth.api.ts` agora fala com o backend (`signInPatientReal`, `registerPatient`)
- Componentes de UI: `Button`, `Card`, `Input`, `Alert`
- Layout: `Header` (com contador de carrinho), `MainContainer`, `AuthGuard`
- `CartContext` com persistência em `localStorage`
- API clients: products, shipping, pharmacies, orders, prescriptions
- Tokenização de cartão via Pagar.me (`pagarme.client.ts`) — cartão nunca toca o backend
- Páginas: `/produto`, `/carrinho`, `/checkout` com fluxo completo
- `.env.example` do `apps/web` com `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PAGARME_PUBLIC_KEY`

---

## ⚠️ Pré-requisitos antes de rodar em dev

1. **Rodar migration Prisma** (schema mudou):
   ```bash
   cd apps/api && pnpm exec prisma migrate dev --name add_order_shipping_gateway
   ```
2. **Preencher variáveis de ambiente**:
   - `apps/api/.env` → `PAGARME_API_KEY` (secret, começa com `sk_`)
   - `apps/web/.env.local` → `NEXT_PUBLIC_PAGARME_PUBLIC_KEY` (public, começa com `pk_`)
3. **Buildar shared-types** se der erro `TS6305`:
   ```bash
   pnpm --filter @maemais/shared-types build
   ```

---

## 🔴 Pendências críticas (bloqueantes para produção)

### 1. Webhook Pagar.me (`POST /payments/webhook`)
**Por quê:** hoje o status do pedido é atualizado de forma síncrona no `payOrder`. Se o cliente pagar um PIX 10 minutos depois, ou se houver estorno/disputa/chargeback, nada atualiza o `Order`.

**O que fazer:**
- Criar `PaymentsModule` com controller `POST /payments/webhook`
- Validar assinatura via `PAGARME_WEBHOOK_SECRET` (header `X-Hub-Signature`)
- Mapear eventos Pagar.me → mudança de status do `Order`:
  - `charge.paid` → `OrderStatus.PAID`
  - `charge.payment_failed` → `OrderStatus.CANCELLED`
  - `charge.refunded` → adicionar `REFUNDED` ao enum
  - `charge.chargeback` → alerta + manter registro
- Idempotência: usar `gatewayOrderId` + `event.id` para não processar 2x
- Configurar URL do webhook no dashboard Pagar.me

### 2. Frete real (Correios ou Melhor Envio)
**Por quê:** hoje é tabela regional fixa por UF em `shipping.service.ts:buildOptionsForState`. Não reflete peso/dimensões dos produtos nem preços reais.

**Opções:**
- **Melhor Envio** (recomendado): API REST direta, suporta múltiplas transportadoras, grátis até certo volume. Substituir `buildOptionsForState` por chamada a `https://melhorenvio.com.br/api/v2/me/shipment/calculate`
- **Correios WebService**: mais barato mas API SOAP antiga, menos documentada

**Impacto no modelo:** `Product` precisa ganhar `weightGrams`, `heightCm`, `widthCm`, `lengthCm` no Prisma.

### 3. Farmácias parceiras reais
**Estado atual:** 3 farmácias hardcoded em `pharmacy.service.ts`.

**O que fazer:**
- Criar model `PartnerPharmacy` no Prisma (id, nome, CNPJ, endereço completo, coordenadas lat/lng, rating, áreas de cobertura)
- Endpoint admin para CRUD de farmácias
- `GET /pharmacies?zipCode=` filtrar por distância Haversine ou por prefixo de CEP
- Associar `Order.partnerPharmacyId` → `PartnerPharmacy.id` como FK real

### 4. Emissão de NF no fluxo pós-pagamento
**Por quê:** o schema já tem `Invoice` e já existe `invoices/listeners/order-paid.listener.ts` ouvindo `ORDER_PAID`, mas precisa conectar com SEFAZ ou gateway de NF (ex: Focus NFe, NFe.io).

---

## 🟡 Pendências importantes (melhorias relevantes)

### 5. Recuperação de pedido abandonado
- Hoje o `draft` do checkout fica em `sessionStorage`. Se o user fechar a aba no meio do pagamento, perde tudo.
- Sugestão: persistir carrinho no backend (novo model `Cart`) + notificação por email/push após N horas.

### 6. Validação de CPF no checkout
- Hoje o campo CPF é texto livre. Adicionar validação de dígitos verificadores + máscara no `Input`.

### 7. Máscaras nos campos
- CEP, telefone, cartão, CPF, validade MM/AA — hoje são `<input>` livres. Adicionar uma lib leve (`imask` ou `react-imask`) ou escrever máscaras manuais.

### 8. Cupons de desconto
- Backend e schema não suportam descontos. Adicionar `Coupon` model + campo `discountAmount` no `Order`.

### 9. Tela de acompanhamento de pedido
- `/minha-conta/pedidos` ainda retorna `null`. Implementar listagem usando `listMyOrders()` que já existe em `orders.api.ts`.
- Detalhe do pedido com status, tracking code (quando `SHIPPED`), nota fiscal, botão de 2ª via.

### 10. Reutilização de endereço
- Hoje o user digita o endereço todo toda vez. Adicionar model `UserAddress` (com `isDefault`) e selector no checkout.

### 11. Múltiplos itens de prescrições diferentes no carrinho
- Hoje o `createOrder` exige 1 `prescriptionId`. Se o user tiver 2 prescrições ativas e adicionar itens das duas, o fluxo falha.
- Decisões a tomar:
  - **(a)** bloquear: carrinho só aceita itens de 1 prescrição por vez
  - **(b)** dividir em múltiplos `Order` automaticamente no checkout
  - **(c)** permitir múltiplas prescrições por order (mais invasivo no schema)

### 12. Validação de estoque
- Nenhuma verificação de estoque antes de criar pedido. Adicionar `Product.stockQuantity` + lock otimista no `createOrder`.

---

## 🟢 Melhorias de qualidade / devex

### 13. Testes e2e do fluxo completo
- Jest está configurado para e2e (`pnpm test:e2e` usa `./test/jest-e2e.config.js`), mas não há um cenário cobrindo o happy path produto → carrinho → frete → checkout → pagamento.
- Escrever teste usando supertest que:
  1. Cria user PATIENT
  2. Submete questionário
  3. Médico aprova (via service direto)
  4. Cotação de frete
  5. Cria order com endereço
  6. Paga (com `PAGARME_API_KEY` ausente → mock retorna success)
  7. Verifica status `PAID`

### 14. Testes de frontend
- Nenhum teste no `apps/web`. Adicionar Vitest + Testing Library + um teste por página chave (CartContext, fluxo de add to cart guarded, checkout form submission).

### 15. Rate limiting específico para pagamentos
- O `ThrottlerGuard` global está 100 req/min. Pagamentos deveriam ser mais restritivos (ex: 5/min por user).

### 16. Observabilidade
- Adicionar logs estruturados (pino) no fluxo de pagamento: `orderId`, `gatewayOrderId`, `userId`, `status`, `durationMs`
- Métricas: taxa de conversão carrinho→pagamento, taxa de recusa por bandeira, tempo médio de resposta do Pagar.me

### 17. Tratamento de erro do ViaCEP
- Hoje qualquer erro vira "CEP inválido". ViaCEP tem um rate limit informal — diferenciar rate limit de CEP inexistente.

### 18. Design system de verdade
- Os componentes UI são CSS-in-JS inline (funcional, mas não escala). Quando tiver mais telas, migrar para:
  - Tailwind + shadcn/ui (mais rápido de iterar)
  - ou Panda CSS / Vanilla Extract (mais type-safe)

### 19. Acessibilidade
- Botões de opção de frete/farmácia são `<button>` simulando radio — funciona, mas falta `role="radiogroup"`, `aria-checked`, navegação por teclado.
- Tabs de pagamento (Cartão/PIX) também precisam de `role="tablist"`.

### 20. Internacionalização
- Todos os textos estão em pt-BR hardcoded. Se for escalar, considerar `next-intl`.

---

## 📋 Checklist rápido para homologação Pagar.me

Antes de ir pra produção, o Pagar.me geralmente pede:

- [ ] Webhook configurado e respondendo 200
- [ ] Tratamento de todos os status de charge (`paid`, `waiting_payment`, `failed`, `refunded`, `chargedback`)
- [ ] Retry/idempotência implementada
- [ ] Logs de auditoria de toda transação
- [ ] Conformidade com PCI-DSS — **OK** (cartão tokenizado no front, nunca toca o backend)
- [ ] Ambiente de sandbox testado com cartões de teste Pagar.me
- [ ] Recibo/confirmação por email pós-pagamento (existe `Notification` model — conectar)

---

## 🗺️ Ordem sugerida de ataque

Se tivesse que escolher uma ordem:

1. **Webhook Pagar.me** (item 1) — sem isso você perde eventos e o status fica errado
2. **Migration + envs** (pré-requisitos) — senão nem sobe
3. **Farmácias reais** (item 3) — simples e desbloqueia uma das regras do produto
4. **Frete real** (item 2) — Melhor Envio, ~1 dia de trabalho
5. **Estoque + validação CPF + máscaras** (itens 12, 6, 7) — qualidade de UX
6. **Tela de pedidos** (item 9) — fecha o loop pós-compra
7. **Emissão NF** (item 4) — já tem a base, falta o gateway fiscal
8. **Testes e2e** (item 13) — trava regressões antes de ir pra produção
