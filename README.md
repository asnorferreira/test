# Projeto OPTA

# Plataforma de Informações Esportivas — Atualização Backend

Este documento atualiza **o que você já tem** para o **novo modelo funcional** (planos, assinaturas, afiliados, métricas, cupons, logs, Opta + Redis, regra Scout Free por CPF/rodada, etc.), mantendo a **stack**: Node.js + Express + Prisma + PostgreSQL + Redis.

---

## 1) Variáveis de ambiente (.env) — atualizadas

```bash
# Porta
PORT=4300

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_esportes?schema=public"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# JWT
JWT_SECRET=supersecreto
JWT_EXPIRES_IN=7d

# API Opta
OPTA_API_KEY=sua_chave_aqui
OPTA_BASE_URL=https://api.opta.com
OPTA_TIMEOUT_MS=8000
OPTA_RATE_LIMIT_RPS=8

# Pagamentos (exemplo genérico)
PAYMENTS_PROVIDER=stripe # ou pagarme/mercadopago
PAYMENTS_WEBHOOK_SECRET=whsec_xxx

# E-mail/Push
EMAIL_PROVIDER=resend # ou ses
EMAIL_FROM=noreply@seu-dominio.com
PUSH_FCM_CREDENTIALS_JSON=""

# Segurança
ENCRYPTION_KEY=base64:aesgcm_32bytes

```

> Observações:
> 
> - `ENCRYPTION_KEY` para criptografar CPF (AES-GCM). Pode ser gerenciada por KMS.
> - Ajuste `OPTA_RATE_LIMIT_RPS` conforme contrato.

---

## 2) Estrutura de pastas — incrementos

```
backend/
│── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   ├── opta.ts          # cliente Opta com rate limit e cache helper
│   │   └── crypto.ts        # util p/ criptografar/decriptar CPF
│   │
│   ├── middlewares/
│   │   ├── auth.ts          # valida JWT e popula req.user
│   │   ├── rbac.ts          # enforce roles/escopos
│   │   ├── usageFree.ts     # regra Scout Free 1 jogo/rodada
│   │   └── error.ts         # tratador de erros centralizados
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── plans/           # CRUD Plan, Coupons
│   │   ├── subscriptions/   # checkout, webhooks, status
│   │   ├── affiliates/      # links, cliques, comissões, payout, metas
│   │   ├── attribution/     # UTMs e vinculação
│   │   ├── finance/         # MRR, ARR, churn, CAC
│   │   ├── leagues/
│   │   ├── rounds/
│   │   ├── matches/
│   │   ├── insights/        # análises (sem apostas)
│   │   ├── notifications/
│   │   ├── logs/
│   │   └── exports/
│   │
│   ├── workers/
│   │   ├── index.ts
│   │   ├── optaIngest.ts    # ingestão incremental Opta
│   │   └── eventsFanout.ts  # dispara notificações on-change
│   │
│   ├── utils/
│   │   ├── http.ts
│   │   ├── pagination.ts
│   │   └── idempotency.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema.prisma  # atualizado abaixo

```

---

## 3) `schema.prisma` — versão unificada (cole e rode migração)

> Mantém seus modelos originais e adiciona os módulos novos. Se já houver colunas com o mesmo nome/tipo, mantenha as suas.
> 

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Enums ---

enum Role { ADMIN AFFILIATE USER }

enum SubStatus { ACTIVE CANCELED PAST_DUE }

enum TxType { CHARGE REFUND ADJUSTMENT }

enum TxStatus { PENDING PAID FAILED REFUNDED }

enum CommissionStatus { PENDING APPROVED PAID }

enum PayoutMethod { PIX BANK_TRANSFER DIGITAL_WALLET }

enum PayoutStatus { PENDING IN_REVIEW PAID FAILED }

enum RoundStatus { OPEN CLOSED }

enum InsightVisibility { PLAN_FREE PLAN_START PLAN_EXPERT }

enum LogLevel { INFO WARN ERROR }

// --- Usuários & Acesso ---
model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  password      String
  cpf           String?        @unique
  role          Role           @default(USER)
  isSuspended   Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  affiliates    Affiliate[]
  subscriptions Subscription[]
  userUsages    UserRoundUsage[]
  attributions  Attribution[]
  notifications Notification[]
  payouts       Payout[]       @relation("UserPayouts")
  auditLogs     AuditLog[]     @relation("UserAudit")
}

model UserRoundUsage {
  id        Int      @id @default(autoincrement())
  userId    Int
  roundId   Int
  usedCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  round     Round    @relation(fields: [roundId], references: [id])

  @@unique([userId, roundId])
}

// --- Planos / Assinaturas / Cupons / Transações ---
model Plan {
  id             Int        @id @default(autoincrement())
  name           String     @unique
  priceCents     Int        @default(0)
  isActive       Boolean    @default(true)
  benefits       Json?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  subscriptions  Subscription[]
}

model Subscription {
  id             Int        @id @default(autoincrement())
  userId         Int
  planId         Int
  status         SubStatus  @default(ACTIVE)
  isTrial        Boolean    @default(false)
  trialEndsAt    DateTime?
  startedAt      DateTime   @default(now())
  canceledAt     DateTime?
  externalRef    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  user           User       @relation(fields: [userId], references: [id])
  plan           Plan       @relation(fields: [planId], references: [id])
  transactions   Transaction[]
}

model Coupon {
  id            Int       @id @default(autoincrement())
  code          String    @unique
  percentageOff Int?
  valueOffCents Int?
  usageLimit    Int?
  usedCount     Int       @default(0)
  startsAt      DateTime?
  endsAt        DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Transaction {
  id             Int         @id @default(autoincrement())
  userId         Int
  subscriptionId Int?
  amountCents    Int
  type           TxType
  status         TxStatus
  externalRef    String?
  metadata       Json?
  createdAt      DateTime    @default(now())

  user           User        @relation(fields: [userId], references: [id])
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  commissions    Commission[]
}

// --- Afiliados & Atribuição ---
model Affiliate {
  id            Int            @id @default(autoincrement())
  userId        Int            @unique
  trackingId    String         @unique
  commissionBps Int            @default(1000)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user          User           @relation(fields: [userId], references: [id])
  links         AffiliateLink[]
  commissions   Commission[]
  goals         AffiliateGoal[]
}

model AffiliateLink {
  id           Int      @id @default(autoincrement())
  affiliateId  Int
  slug         String   @unique
  urlTarget    String
  createdAt    DateTime @default(now())

  affiliate    Affiliate @relation(fields: [affiliateId], references: [id])
  clicks       Click[]
}

model Click {
  id              Int      @id @default(autoincrement())
  affiliateLinkId Int
  ip              String?
  userAgent       String?
  utm             Json?
  createdAt       DateTime @default(now())

  affiliateLink   AffiliateLink @relation(fields: [affiliateLinkId], references: [id])
}

model Attribution {
  id           Int      @id @default(autoincrement())
  userId       Int
  affiliateId  Int?
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  firstTouchAt DateTime  @default(now())
  lastTouchAt  DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id])
  affiliate    Affiliate? @relation(fields: [affiliateId], references: [id])
}

model Commission {
  id             Int              @id @default(autoincrement())
  affiliateId    Int
  userId         Int?
  transactionId  Int?
  amountCents    Int
  status         CommissionStatus @default(PENDING)
  createdAt      DateTime @default(now())
  approvedAt     DateTime?
  paidAt         DateTime?

  affiliate      Affiliate  @relation(fields: [affiliateId], references: [id])
  user           User?      @relation(fields: [userId], references: [id])
  transaction    Transaction? @relation(fields: [transactionId], references: [id])
}

model Payout {
  id            Int          @id @default(autoincrement())
  affiliateId   Int
  toUserId      Int
  amountCents   Int
  method        PayoutMethod
  status        PayoutStatus @default(PENDING)
  pixKey        String?
  bankInfo      Json?
  createdAt     DateTime     @default(now())
  paidAt        DateTime?

  affiliate     Affiliate    @relation(fields: [affiliateId], references: [id])
  toUser        User         @relation("UserPayouts", fields: [toUserId], references: [id])
}

model AffiliateGoal {
  id            Int      @id @default(autoincrement())
  affiliateId   Int
  label         String
  targetCents   Int
  monthRef      DateTime
  progressCents Int      @default(0)
  createdAt     DateTime @default(now())

  affiliate     Affiliate @relation(fields: [affiliateId], references: [id])
}

// --- Domínio esportivo (Opta) ---
model League {
  id        Int      @id @default(autoincrement())
  optaId    String   @unique
  name      String
  country   String?
  createdAt DateTime @default(now())

  rounds    Round[]
}

model Team {
  id        Int      @id @default(autoincrement())
  optaId    String   @unique
  name      String
  shortName String?
  createdAt DateTime @default(now())
}

model Round {
  id        Int         @id @default(autoincrement())
  leagueId  Int
  optaId    String      @unique
  number    Int
  status    RoundStatus @default(OPEN)
  startsAt  DateTime?
  endsAt    DateTime?

  league    League      @relation(fields: [leagueId], references: [id])
  matches   Match[]
  usages    UserRoundUsage[]
}

model Match {
  id          Int          @id @default(autoincrement())
  optaId      String       @unique
  leagueId    Int?
  roundId     Int?
  homeTeamId  Int?
  awayTeamId  Int?
  homeTeam    String
  awayTeam    String
  score       String?
  date        DateTime
  status      String?
  stats       Json?
  createdAt   DateTime     @default(now())

  league      League?      @relation(fields: [leagueId], references: [id])
  round       Round?       @relation(fields: [roundId], references: [id])
  homeRef     Team?        @relation("homeRef", fields: [homeTeamId], references: [id])
  awayRef     Team?        @relation("awayRef", fields: [awayTeamId], references: [id])
  insights    Insight[]
}

// --- Conteúdo / Insights (sem apostas) ---
model Insight {
  id          Int      @id @default(autoincrement())
  matchId     Int
  authorId    Int?
  title       String
  body        String
  tags        String[]
  visibility  InsightVisibility @default(PLAN_START)
  accuracy    Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  match       Match    @relation(fields: [matchId], references: [id])
  author      User?    @relation(fields: [authorId], references: [id])
}

// --- Notificações & Logs ---
model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  type      String
  title     String
  body      String
  payload   Json?
  readAt    DateTime?
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
}

model SystemLog {
  id        Int       @id @default(autoincrement())
  level     LogLevel  @default(INFO)
  message   String
  context   Json?
  createdAt DateTime  @default(now())
}

model IntegrationError {
  id        Int       @id @default(autoincrement())
  provider  String
  endpoint  String?
  payload   Json?
  error     String
  createdAt DateTime  @default(now())
}

model AuditLog {
  id        Int       @id @default(autoincrement())
  actorId   Int?
  action    String
  entity    String
  entityId  String?
  diff      Json?
  createdAt DateTime  @default(now())

  actor     User?     @relation("UserAudit", fields: [actorId], references: [id])
}

```

**Comandos:**

```bash
npx prisma generate
npx prisma migrate dev --name init_affiliates_plans_insights_optadomain

```

---

## 4) Middlewares essenciais (exemplos)

### `middlewares/rbac.ts`

```tsx
import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: Array<'ADMIN'|'AFFILIATE'|'USER'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

```

### `middlewares/usageFree.ts`

```tsx
import { prisma } from '../config/database';

export function enforceFreeLimit() {
  return async (req: any, res: any, next: any) => {
    const user = req.user; // populado pelo auth
    const { roundId } = req.params; // ou derivado do match

    // Usuários pagantes ignoram a trava
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true }
    });
    const isFreePlan = !activeSub || activeSub.plan.name.toUpperCase() === 'FREE';
    if (!isFreePlan) return next();

    const usage = await prisma.userRoundUsage.upsert({
      where: { userId_roundId: { userId: user.id, roundId: Number(roundId) } },
      update: {},
      create: { userId: user.id, roundId: Number(roundId), usedCount: 0 }
    });

    if (usage.usedCount >= 1) {
      return res.status(402).json({
        code: 'FREE_LIMIT_REACHED',
        message: 'Limite do plano Free atingido para esta rodada. Faça upgrade para ver mais jogos.'
      });
    }

    await prisma.userRoundUsage.update({
      where: { userId_roundId: { userId: user.id, roundId: Number(roundId) } },
      data: { usedCount: { increment: 1 } }
    });

    next();
  };
}

```

---

## 5) Opta client + cache (exemplo)

### `config/opta.ts`

```tsx
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import { env } from './env';
import { redis } from './redis';

const limiter = new Bottleneck({
  minTime: Math.ceil(1000 / Number(env.OPTA_RATE_LIMIT_RPS || 8))
});

async function http(path: string) {
  const url = `${env.OPTA_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${env.OPTA_API_KEY}` },
    timeout: Number(env.OPTA_TIMEOUT_MS || 8000)
  } as any);
  if (!res.ok) throw new Error(`OPTA ${res.status}`);
  return res.json();
}

export async function getMatchCached(optaId: string) {
  const key = `opta:match:${optaId}`;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const data = await limiter.schedule(() => http(`/matches/${optaId}`));
  const ttl = data?.status === 'live' ? 30 : 1800;
  await redis.set(key, JSON.stringify(data), { EX: ttl });
  return data;
}

```

---

## 6) Rotas Express — resumo prático

```tsx
// app.ts (trechos)
import express from 'express';
import { requireRole } from './middlewares/rbac';
import { enforceFreeLimit } from './middlewares/usageFree';

const app = express();
app.use(express.json());

// Plans
app.get('/plans', plansController.list);
app.post('/admin/plans', requireRole('ADMIN'), plansController.create);

// Subscriptions
app.post('/subscriptions/checkout', auth, subscriptionsController.checkout);
app.post('/webhooks/payments', subscriptionsController.webhook); // idempotência dentro

// Affiliates
app.get('/affiliate/dashboard', auth, requireRole('AFFILIATE'), affiliateController.dashboard);
app.post('/affiliate/links', auth, requireRole('AFFILIATE'), affiliateController.createLink);

// Rounds/Matches/Insights
app.get('/leagues/:leagueId/rounds', roundsController.list);
app.post('/admin/rounds', auth, requireRole('ADMIN'), roundsController.upsert);
app.post('/rounds/:roundId/consume', auth, enforceFreeLimit(), (req, res) => res.json({ ok: true }));
app.get('/matches/:optaId', matchesController.getOne); // mistura DB + cache
app.get('/matches/:matchId/insights', insightsController.list);
app.post('/admin/insights', auth, requireRole('ADMIN'), insightsController.upsert);

// Finance
app.get('/admin/finance/overview', auth, requireRole('ADMIN'), financeController.overview);

export default app;

```

---

## 7) Payout & Comissões — fluxo mínimo

1. **Click**: salva `Click` com UTM (quando abre link de afiliado).
2. **Signup**: cria `Attribution` (first/last touch) associando `userId` ↔ `affiliateId`.
3. **Pagamento**: webhook cria `Transaction(PAID)` e gera `Commission(PENDING)` com `amountCents * (bps/10000)`.
4. **Aprovação**: após janela antifraude, `Commission → APPROVED`.
5. **Pagamento**: cria `Payout` e marca `Commission → PAID`.

---

## 8) Financeiro — métricas

- **MRR/ARR**: soma dos `Subscription` ativos e seus `Plan.priceCents`.
- **Churn**: `count(Subscription CANCELED no período) / base ativa início período`.
- **CAC**: `(Transações ADJUSTMENT de marketing + Comissões pagas no período) / Novos pagantes`.

Endpoints admin retornam séries por mês com `GROUP BY date_trunc('month', createdAt)`.

---

## 9) Exportações

- CSV/XLSX: gere com `fast-csv`/`exceljs`.
- PDF: `puppeteer` renderizando uma rota `/admin/reports/:id` (HTML) em PDF.

---

## 10) Segurança & LGPD

- CPF criptografado em repouso (util `crypto.ts`).
- Logs sem PII; `AuditLog` para ações sensíveis.
- Rate limit público (p.ex. `express-rate-limit`) e idempotência em webhooks.
- OpenTelemetry + logs estruturados.

---

## 11) Scripts úteis

```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "studio": "prisma studio"
  }
}

```

---

## 12) Próximos passos

1. Colar o `schema.prisma` e rodar `generate` + `migrate`.
2. Criar/trocar middlewares (`auth`, `rbac`, `usageFree`).
3. Subir `opta.ts` e configurar Redis.
4. Implementar rotas mínimas listadas.
5. (Opcional) Iniciar **workers** para ingestão incremental e fanout de eventos.

Pronto. Este pacote alinha seu backend ao novo escopo sem quebrar a base existente. Ajustes finos de naming e validações podem ser feitos conforme sua regra de produto.

A plataforma consumirá a **API Opta** para exibir resultados, estatísticas e dados em tempo real.

### Painéis:

- **Painel Administrativo** → Gestão centralizada de usuários, afiliados, conteúdos e relatórios.
- **Painel de Afiliados** → Métricas de desempenho, indicações e relatórios em tempo real.

---

## 2. Configuração do Ambiente

### Requisitos

- **Node.js** (>= 20.x)
- **npm** ou **yarn**
- **PostgreSQL** (recomendado)
- **Redis** (cache de dados da API Opta)
- **Prisma ORM**
- **Git**

### Setup:

```mermaid
# Clonar repositório
git clone https://github.com/seu-repo/nome-do-projeto.git
cd nome-do-projeto

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Configuração do .env

```mermaid
# Porta do servidor
PORT=4300

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_esportes?schema=public"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT
JWT_SECRET=supersecreto

# API Opta
OPTA_API_KEY=sua_chave_aqui
```

## 3.Estrutura do back-end

```mermaid
backend/
│── src/
│   ├── config/            # Configurações (DB, Redis, env, API Opta)
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   └── opta.ts
│   │
│   ├── modules/           # Domínios do sistema
│   │   ├── auth/          # Login e autenticação (JWT)
│   │   ├── users/         # Usuários (admin, afiliados, comuns)
│   │   ├── affiliates/    # Painel de afiliados
│   │   ├── matches/       # Jogos, placares e estatísticas (API Opta)
│   │   ├── metrics/       # Métricas em tempo real
│   │   └── notifications/ # Push notifications
│   │
│   ├── middlewares/       # Autenticação, logs, erros
│   ├── utils/             # Funções utilitárias
│   ├── app.ts             # Configuração Express
│   └── server.ts          # Inicialização do servidor
│
├── prisma/                # Schema e migrations
│   └── schema.prisma
│
├── tests/                 # Testes automatizados
├── package.json
└── tsconfig.json
```

## 4. Banco de dados prisma / Sequelize

```mermaid
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          Int          @id @default(autoincrement())
  name        String
  email       String       @unique
  password    String
  role        Role         @default(USER)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  affiliates  Affiliate[]
}

model Affiliate {
  id          Int          @id @default(autoincrement())
  userId      Int
  user        User         @relation(fields: [userId], references: [id])
  metrics     Metric[]
}

model Metric {
  id          Int          @id @default(autoincrement())
  affiliateId Int
  affiliate   Affiliate    @relation(fields: [affiliateId], references: [id])
  event       String
  value       Int
  createdAt   DateTime     @default(now())
}

model Match {
  id          Int          @id @default(autoincrement())
  optaId      String       @unique
  homeTeam    String
  awayTeam    String
  score       String?
  date        DateTime
  stats       Json?
  createdAt   DateTime     @default(now())
}

enum Role {
  ADMIN
  AFFILIATE
  USER
}
```

## 5. Diagrama ERD (Entidade Relacionamento)

```
erDiagram
    USER {
        Int id PK
        String name
        String email
        String password
        Role role
        DateTime createdAt
        DateTime updatedAt
    }

    AFFILIATE {
        Int id PK
        Int userId FK
    }

    METRIC {
        Int id PK
        Int affiliateId FK
        String event
        Int value
        DateTime createdAt
    }

    MATCH {
        Int id PK
        String optaId
        String homeTeam
        String awayTeam
        String score
        DateTime date
        Json stats
        DateTime createdAt
    }

    USER ||--o{ AFFILIATE : "possui"
    AFFILIATE ||--o{ METRIC : "gera"
```

## 6. Funcionalidades Principais

- **Consulta de Resultados e Estatísticas** (em tempo real via API Opta)
- **Painel Administrativo** → Gestão de usuários, afiliados e relatórios
- **Painel de Afiliados** → Métricas de indicações e desempenho
- **Cache com Redis** → Reduz latência e otimiza consumo da API
- **Notificações Push (Opcional)** → Baseadas em eventos esportivos da API Opta

# Plataforma de Informações Esportivas — Atualização Backend

Este documento atualiza **o que você já tem** para o **novo modelo funcional** (planos, assinaturas, afiliados, métricas, cupons, logs, Opta + Redis, regra Scout Free por CPF/rodada, etc.), mantendo a **stack**: Node.js + Express + Prisma + PostgreSQL + Redis.

---

## 1) Variáveis de ambiente (.env) — atualizadas

```bash
# Porta
PORT=4300

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_esportes?schema=public"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# JWT
JWT_SECRET=supersecreto
JWT_EXPIRES_IN=7d

# API Opta
OPTA_API_KEY=sua_chave_aqui
OPTA_BASE_URL=https://api.opta.com
OPTA_TIMEOUT_MS=8000
OPTA_RATE_LIMIT_RPS=8

# Pagamentos (exemplo genérico)
PAYMENTS_PROVIDER=stripe # ou pagarme/mercadopago
PAYMENTS_WEBHOOK_SECRET=whsec_xxx

# E-mail/Push
EMAIL_PROVIDER=resend # ou ses
EMAIL_FROM=noreply@seu-dominio.com
PUSH_FCM_CREDENTIALS_JSON=""

# Segurança
ENCRYPTION_KEY=base64:aesgcm_32bytes

```

> Observações:
> 
> - `ENCRYPTION_KEY` para criptografar CPF (AES-GCM). Pode ser gerenciada por KMS.
> - Ajuste `OPTA_RATE_LIMIT_RPS` conforme contrato.

---

## 2) Estrutura de pastas — incrementos

```
backend/
│── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   ├── opta.ts          # cliente Opta com rate limit e cache helper
│   │   └── crypto.ts        # util p/ criptografar/decriptar CPF
│   │
│   ├── middlewares/
│   │   ├── auth.ts          # valida JWT e popula req.user
│   │   ├── rbac.ts          # enforce roles/escopos
│   │   ├── usageFree.ts     # regra Scout Free 1 jogo/rodada
│   │   └── error.ts         # tratador de erros centralizados
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── plans/           # CRUD Plan, Coupons
│   │   ├── subscriptions/   # checkout, webhooks, status
│   │   ├── affiliates/      # links, cliques, comissões, payout, metas
│   │   ├── attribution/     # UTMs e vinculação
│   │   ├── finance/         # MRR, ARR, churn, CAC
│   │   ├── leagues/
│   │   ├── rounds/
│   │   ├── matches/
│   │   ├── insights/        # análises (sem apostas)
│   │   ├── notifications/
│   │   ├── logs/
│   │   └── exports/
│   │
│   ├── workers/
│   │   ├── index.ts
│   │   ├── optaIngest.ts    # ingestão incremental Opta
│   │   └── eventsFanout.ts  # dispara notificações on-change
│   │
│   ├── utils/
│   │   ├── http.ts
│   │   ├── pagination.ts
│   │   └── idempotency.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema.prisma  # atualizado abaixo

```

---

## 3) `schema.prisma` — versão unificada (cole e rode migração)

> Mantém seus modelos originais e adiciona os módulos novos. Se já houver colunas com o mesmo nome/tipo, mantenha as suas.
> 

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- Enums ---

enum Role { ADMIN AFFILIATE USER }

enum SubStatus { ACTIVE CANCELED PAST_DUE }

enum TxType { CHARGE REFUND ADJUSTMENT }

enum TxStatus { PENDING PAID FAILED REFUNDED }

enum CommissionStatus { PENDING APPROVED PAID }

enum PayoutMethod { PIX BANK_TRANSFER DIGITAL_WALLET }

enum PayoutStatus { PENDING IN_REVIEW PAID FAILED }

enum RoundStatus { OPEN CLOSED }

enum InsightVisibility { PLAN_FREE PLAN_START PLAN_EXPERT }

enum LogLevel { INFO WARN ERROR }

// --- Usuários & Acesso ---
model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  password      String
  cpf           String?        @unique
  role          Role           @default(USER)
  isSuspended   Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  affiliates    Affiliate[]
  subscriptions Subscription[]
  userUsages    UserRoundUsage[]
  attributions  Attribution[]
  notifications Notification[]
  payouts       Payout[]       @relation("UserPayouts")
  auditLogs     AuditLog[]     @relation("UserAudit")
}

model UserRoundUsage {
  id        Int      @id @default(autoincrement())
  userId    Int
  roundId   Int
  usedCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  round     Round    @relation(fields: [roundId], references: [id])

  @@unique([userId, roundId])
}

// --- Planos / Assinaturas / Cupons / Transações ---
model Plan {
  id             Int        @id @default(autoincrement())
  name           String     @unique
  priceCents     Int        @default(0)
  isActive       Boolean    @default(true)
  benefits       Json?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  subscriptions  Subscription[]
}

model Subscription {
  id             Int        @id @default(autoincrement())
  userId         Int
  planId         Int
  status         SubStatus  @default(ACTIVE)
  isTrial        Boolean    @default(false)
  trialEndsAt    DateTime?
  startedAt      DateTime   @default(now())
  canceledAt     DateTime?
  externalRef    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  user           User       @relation(fields: [userId], references: [id])
  plan           Plan       @relation(fields: [planId], references: [id])
  transactions   Transaction[]
}

model Coupon {
  id            Int       @id @default(autoincrement())
  code          String    @unique
  percentageOff Int?
  valueOffCents Int?
  usageLimit    Int?
  usedCount     Int       @default(0)
  startsAt      DateTime?
  endsAt        DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Transaction {
  id             Int         @id @default(autoincrement())
  userId         Int
  subscriptionId Int?
  amountCents    Int
  type           TxType
  status         TxStatus
  externalRef    String?
  metadata       Json?
  createdAt      DateTime    @default(now())

  user           User        @relation(fields: [userId], references: [id])
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  commissions    Commission[]
}

// --- Afiliados & Atribuição ---
model Affiliate {
  id            Int            @id @default(autoincrement())
  userId        Int            @unique
  trackingId    String         @unique
  commissionBps Int            @default(1000)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user          User           @relation(fields: [userId], references: [id])
  links         AffiliateLink[]
  commissions   Commission[]
  goals         AffiliateGoal[]
}

model AffiliateLink {
  id           Int      @id @default(autoincrement())
  affiliateId  Int
  slug         String   @unique
  urlTarget    String
  createdAt    DateTime @default(now())

  affiliate    Affiliate @relation(fields: [affiliateId], references: [id])
  clicks       Click[]
}

model Click {
  id              Int      @id @default(autoincrement())
  affiliateLinkId Int
  ip              String?
  userAgent       String?
  utm             Json?
  createdAt       DateTime @default(now())

  affiliateLink   AffiliateLink @relation(fields: [affiliateLinkId], references: [id])
}

model Attribution {
  id           Int      @id @default(autoincrement())
  userId       Int
  affiliateId  Int?
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  firstTouchAt DateTime  @default(now())
  lastTouchAt  DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id])
  affiliate    Affiliate? @relation(fields: [affiliateId], references: [id])
}

model Commission {
  id             Int              @id @default(autoincrement())
  affiliateId    Int
  userId         Int?
  transactionId  Int?
  amountCents    Int
  status         CommissionStatus @default(PENDING)
  createdAt      DateTime @default(now())
  approvedAt     DateTime?
  paidAt         DateTime?

  affiliate      Affiliate  @relation(fields: [affiliateId], references: [id])
  user           User?      @relation(fields: [userId], references: [id])
  transaction    Transaction? @relation(fields: [transactionId], references: [id])
}

model Payout {
  id            Int          @id @default(autoincrement())
  affiliateId   Int
  toUserId      Int
  amountCents   Int
  method        PayoutMethod
  status        PayoutStatus @default(PENDING)
  pixKey        String?
  bankInfo      Json?
  createdAt     DateTime     @default(now())
  paidAt        DateTime?

  affiliate     Affiliate    @relation(fields: [affiliateId], references: [id])
  toUser        User         @relation("UserPayouts", fields: [toUserId], references: [id])
}

model AffiliateGoal {
  id            Int      @id @default(autoincrement())
  affiliateId   Int
  label         String
  targetCents   Int
  monthRef      DateTime
  progressCents Int      @default(0)
  createdAt     DateTime @default(now())

  affiliate     Affiliate @relation(fields: [affiliateId], references: [id])
}

// --- Domínio esportivo (Opta) ---
model League {
  id        Int      @id @default(autoincrement())
  optaId    String   @unique
  name      String
  country   String?
  createdAt DateTime @default(now())

  rounds    Round[]
}

model Team {
  id        Int      @id @default(autoincrement())
  optaId    String   @unique
  name      String
  shortName String?
  createdAt DateTime @default(now())
}

model Round {
  id        Int         @id @default(autoincrement())
  leagueId  Int
  optaId    String      @unique
  number    Int
  status    RoundStatus @default(OPEN)
  startsAt  DateTime?
  endsAt    DateTime?

  league    League      @relation(fields: [leagueId], references: [id])
  matches   Match[]
  usages    UserRoundUsage[]
}

model Match {
  id          Int          @id @default(autoincrement())
  optaId      String       @unique
  leagueId    Int?
  roundId     Int?
  homeTeamId  Int?
  awayTeamId  Int?
  homeTeam    String
  awayTeam    String
  score       String?
  date        DateTime
  status      String?
  stats       Json?
  createdAt   DateTime     @default(now())

  league      League?      @relation(fields: [leagueId], references: [id])
  round       Round?       @relation(fields: [roundId], references: [id])
  homeRef     Team?        @relation("homeRef", fields: [homeTeamId], references: [id])
  awayRef     Team?        @relation("awayRef", fields: [awayTeamId], references: [id])
  insights    Insight[]
}

// --- Conteúdo / Insights (sem apostas) ---
model Insight {
  id          Int      @id @default(autoincrement())
  matchId     Int
  authorId    Int?
  title       String
  body        String
  tags        String[]
  visibility  InsightVisibility @default(PLAN_START)
  accuracy    Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  match       Match    @relation(fields: [matchId], references: [id])
  author      User?    @relation(fields: [authorId], references: [id])
}

// --- Notificações & Logs ---
model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  type      String
  title     String
  body      String
  payload   Json?
  readAt    DateTime?
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
}

model SystemLog {
  id        Int       @id @default(autoincrement())
  level     LogLevel  @default(INFO)
  message   String
  context   Json?
  createdAt DateTime  @default(now())
}

model IntegrationError {
  id        Int       @id @default(autoincrement())
  provider  String
  endpoint  String?
  payload   Json?
  error     String
  createdAt DateTime  @default(now())
}

model AuditLog {
  id        Int       @id @default(autoincrement())
  actorId   Int?
  action    String
  entity    String
  entityId  String?
  diff      Json?
  createdAt DateTime  @default(now())

  actor     User?     @relation("UserAudit", fields: [actorId], references: [id])
}

```

**Comandos:**

```bash
npx prisma generate
npx prisma migrate dev --name init_affiliates_plans_insights_optadomain

```

---

## 4) Middlewares essenciais (exemplos)

### `middlewares/rbac.ts`

```tsx
import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: Array<'ADMIN'|'AFFILIATE'|'USER'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

```

### `middlewares/usageFree.ts`

```tsx
import { prisma } from '../config/database';

export function enforceFreeLimit() {
  return async (req: any, res: any, next: any) => {
    const user = req.user; // populado pelo auth
    const { roundId } = req.params; // ou derivado do match

    // Usuários pagantes ignoram a trava
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true }
    });
    const isFreePlan = !activeSub || activeSub.plan.name.toUpperCase() === 'FREE';
    if (!isFreePlan) return next();

    const usage = await prisma.userRoundUsage.upsert({
      where: { userId_roundId: { userId: user.id, roundId: Number(roundId) } },
      update: {},
      create: { userId: user.id, roundId: Number(roundId), usedCount: 0 }
    });

    if (usage.usedCount >= 1) {
      return res.status(402).json({
        code: 'FREE_LIMIT_REACHED',
        message: 'Limite do plano Free atingido para esta rodada. Faça upgrade para ver mais jogos.'
      });
    }

    await prisma.userRoundUsage.update({
      where: { userId_roundId: { userId: user.id, roundId: Number(roundId) } },
      data: { usedCount: { increment: 1 } }
    });

    next();
  };
}

```

---

## 5) Opta client + cache (exemplo)

### `config/opta.ts`

```tsx
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import { env } from './env';
import { redis } from './redis';

const limiter = new Bottleneck({
  minTime: Math.ceil(1000 / Number(env.OPTA_RATE_LIMIT_RPS || 8))
});

async function http(path: string) {
  const url = `${env.OPTA_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${env.OPTA_API_KEY}` },
    timeout: Number(env.OPTA_TIMEOUT_MS || 8000)
  } as any);
  if (!res.ok) throw new Error(`OPTA ${res.status}`);
  return res.json();
}

export async function getMatchCached(optaId: string) {
  const key = `opta:match:${optaId}`;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const data = await limiter.schedule(() => http(`/matches/${optaId}`));
  const ttl = data?.status === 'live' ? 30 : 1800;
  await redis.set(key, JSON.stringify(data), { EX: ttl });
  return data;
}

```

---

## 6) Rotas Express — resumo prático

```tsx
// app.ts (trechos)
import express from 'express';
import { requireRole } from './middlewares/rbac';
import { enforceFreeLimit } from './middlewares/usageFree';

const app = express();
app.use(express.json());

// Plans
app.get('/plans', plansController.list);
app.post('/admin/plans', requireRole('ADMIN'), plansController.create);

// Subscriptions
app.post('/subscriptions/checkout', auth, subscriptionsController.checkout);
app.post('/webhooks/payments', subscriptionsController.webhook); // idempotência dentro

// Affiliates
app.get('/affiliate/dashboard', auth, requireRole('AFFILIATE'), affiliateController.dashboard);
app.post('/affiliate/links', auth, requireRole('AFFILIATE'), affiliateController.createLink);

// Rounds/Matches/Insights
app.get('/leagues/:leagueId/rounds', roundsController.list);
app.post('/admin/rounds', auth, requireRole('ADMIN'), roundsController.upsert);
app.post('/rounds/:roundId/consume', auth, enforceFreeLimit(), (req, res) => res.json({ ok: true }));
app.get('/matches/:optaId', matchesController.getOne); // mistura DB + cache
app.get('/matches/:matchId/insights', insightsController.list);
app.post('/admin/insights', auth, requireRole('ADMIN'), insightsController.upsert);

// Finance
app.get('/admin/finance/overview', auth, requireRole('ADMIN'), financeController.overview);

export default app;

```

---

## 7) Payout & Comissões — fluxo mínimo

1. **Click**: salva `Click` com UTM (quando abre link de afiliado).
2. **Signup**: cria `Attribution` (first/last touch) associando `userId` ↔ `affiliateId`.
3. **Pagamento**: webhook cria `Transaction(PAID)` e gera `Commission(PENDING)` com `amountCents * (bps/10000)`.
4. **Aprovação**: após janela antifraude, `Commission → APPROVED`.
5. **Pagamento**: cria `Payout` e marca `Commission → PAID`.

---

## 8) Financeiro — métricas

- **MRR/ARR**: soma dos `Subscription` ativos e seus `Plan.priceCents`.
- **Churn**: `count(Subscription CANCELED no período) / base ativa início período`.
- **CAC**: `(Transações ADJUSTMENT de marketing + Comissões pagas no período) / Novos pagantes`.

Endpoints admin retornam séries por mês com `GROUP BY date_trunc('month', createdAt)`.

---

## 9) Exportações

- CSV/XLSX: gere com `fast-csv`/`exceljs`.
- PDF: `puppeteer` renderizando uma rota `/admin/reports/:id` (HTML) em PDF.

---

## 10) Segurança & LGPD

- CPF criptografado em repouso (util `crypto.ts`).
- Logs sem PII; `AuditLog` para ações sensíveis.
- Rate limit público (p.ex. `express-rate-limit`) e idempotência em webhooks.
- OpenTelemetry + logs estruturados.

---

## 11) Scripts úteis

```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "studio": "prisma studio"
  }
}

```

---

## 12) Próximos passos

1. Colar o `schema.prisma` e rodar `generate` + `migrate`.
2. Criar/trocar middlewares (`auth`, `rbac`, `usageFree`).
3. Subir `opta.ts` e configurar Redis.
4. Implementar rotas mínimas listadas.
5. (Opcional) Iniciar **workers** para ingestão incremental e fanout de eventos.

Pronto. Este pacote alinha seu backend ao novo escopo sem quebrar a base existente. Ajustes finos de naming e validações podem ser feitos conforme sua regra de produto.

# Plataforma de Informações Esportivas — Backend vNext (Documento Unificado)

> Objetivo: consolidar e atualizar o backend para o novo modelo funcional (planos, assinaturas, afiliados, métricas, cupons, logs, Opta + Redis, regra Scout Free por CPF/rodada, etc.), sem quebrar o que já existe. Mantemos a stack: Node.js + Express + Prisma + PostgreSQL + Redis.
> 

---

## 0) Stack & Visão Geral

- **Runtime**: Node.js ≥ 20.x, TypeScript
- **Framework**: Express
- **ORM**: Prisma (PostgreSQL)
- **Cache/Rate Limit**: Redis + Bottleneck
- **Auth**: JWT (HS256)
- **Pagamentos**: provedor plugável (Stripe/Pagar.me/Mercado Pago) via webhooks idempotentes
- **Dados esportivos**: API **Opta** com cache e TTL dinâmico
- **Observabilidade**: logs estruturados + (opcional) OpenTelemetry
- **LGPD**: CPF criptografado (AES-GCM), logs sem PII, auditoria

---

## 1) Variáveis de Ambiente (`.env`)

```bash
# Porta
PORT=4300

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_esportes?schema=public"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false

# JWT
JWT_SECRET=supersecreto
JWT_EXPIRES_IN=7d

# API Opta
OPTA_API_KEY=sua_chave_aqui
OPTA_BASE_URL=https://api.opta.com
OPTA_TIMEOUT_MS=8000
OPTA_RATE_LIMIT_RPS=8

# Pagamentos
PAYMENTS_PROVIDER=stripe # ou pagarme/mercadopago
PAYMENTS_WEBHOOK_SECRET=whsec_xxx

# E-mail/Push
EMAIL_PROVIDER=resend # ou ses
EMAIL_FROM=noreply@seu-dominio.com
PUSH_FCM_CREDENTIALS_JSON=""

# Segurança
ENCRYPTION_KEY=base64:aesgcm_32bytes

```

> Notas
> 
> - `ENCRYPTION_KEY`: 32 bytes (AES-256-GCM) em Base64; preferir KMS.
> - Ajuste `OPTA_RATE_LIMIT_RPS` conforme contrato.
> - Para produção, usar `REDIS_TLS=true` e `REDIS_PASSWORD`.

---

## 2) Estrutura de Pastas

```
backend/
│── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   ├── opta.ts          # cliente Opta (rate limit + cache)
│   │   └── crypto.ts        # AES-GCM p/ CPF
│   │
│   ├── middlewares/
│   │   ├── auth.ts          # valida JWT e popula req.user
│   │   ├── rbac.ts          # enforce roles/escopos
│   │   ├── usageFree.ts     # regra Scout Free 1 jogo/rodada
│   │   └── error.ts         # tratador de erros central
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── plans/           # CRUD Plan, Coupons
│   │   ├── subscriptions/   # checkout, webhooks, status
│   │   ├── affiliates/      # links, cliques, comissões, payout, metas
│   │   ├── attribution/     # UTMs e vinculação
│   │   ├── finance/         # MRR, ARR, churn, CAC
│   │   ├── leagues/
│   │   ├── rounds/
│   │   ├── matches/
│   │   ├── insights/        # conteúdo (sem apostas)
│   │   ├── notifications/
│   │   ├── logs/
│   │   └── exports/
│   │
│   ├── workers/
│   │   ├── index.ts
│   │   ├── optaIngest.ts    # ingestão incremental/agg
│   │   └── eventsFanout.ts  # notifica on-change
│   │
│   ├── utils/
│   │   ├── http.ts
│   │   ├── pagination.ts
│   │   └── idempotency.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
└── ...

```

---

## 3) Prisma Schema (Unificado)

> Cole e migre. Mantém modelos pré-existentes; se houver colisões de coluna, preserve as suas. Inclui: usuários/roles, planos/assinaturas, cupons, transações, afiliados/atribuição, comissões/payouts, domínio Opta (leagues/rounds/matches), insights, notificações e logs.
> 

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { ADMIN AFFILIATE USER }

enum SubStatus { ACTIVE CANCELED PAST_DUE }

enum TxType { CHARGE REFUND ADJUSTMENT }

enum TxStatus { PENDING PAID FAILED REFUNDED }

enum CommissionStatus { PENDING APPROVED PAID }

enum PayoutMethod { PIX BANK_TRANSFER DIGITAL_WALLET }

enum PayoutStatus { PENDING IN_REVIEW PAID FAILED }

enum RoundStatus { OPEN CLOSED }

enum InsightVisibility { PLAN_FREE PLAN_START PLAN_EXPERT }

enum LogLevel { INFO WARN ERROR }

model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  password      String
  cpf           String?        @unique
  role          Role           @default(USER)
  isSuspended   Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  affiliates    Affiliate[]
  subscriptions Subscription[]
  userUsages    UserRoundUsage[]
  attributions  Attribution[]
  notifications Notification[]
  payouts       Payout[]       @relation("UserPayouts")
  auditLogs     AuditLog[]     @relation("UserAudit")
}

model UserRoundUsage {
  id        Int      @id @default(autoincrement())
  userId    Int
  roundId   Int
  usedCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  round     Round    @relation(fields: [roundId], references: [id])

  @@unique([userId, roundId])
}

model Plan {
  id             Int        @id @default(autoincrement())
  name           String     @unique
  priceCents     Int        @default(0)
  isActive       Boolean    @default(true)
  benefits       Json?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  subscriptions  Subscription[]
}

model Subscription {
  id             Int        @id @default(autoincrement())
  userId         Int
  planId         Int
  status         SubStatus  @default(ACTIVE)
  isTrial        Boolean    @default(false)
  trialEndsAt    DateTime?
  startedAt      DateTime   @default(now())
  canceledAt     DateTime?
  externalRef    String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  user           User       @relation(fields: [userId], references: [id])
  plan           Plan       @relation(fields: [planId], references: [id])
  transactions   Transaction[]
}

model Coupon {
  id            Int       @id @default(autoincrement())
  code          String    @unique
  percentageOff Int?
  valueOffCents Int?
  usageLimit    Int?
  usedCount     Int       @default(0)
  startsAt      DateTime?
  endsAt        DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Transaction {
  id             Int         @id @default(autoincrement())
  userId         Int
  subscriptionId Int?
  amountCents    Int
  type           TxType
  status         TxStatus
  externalRef    String?
  metadata       Json?
  createdAt      DateTime    @default(now())

  user           User        @relation(fields: [userId], references: [id])
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])
  commissions    Commission[]
}

model Affiliate {
  id            Int            @id @default(autoincrement())
  userId        Int            @unique
  trackingId    String         @unique
  commissionBps Int            @default(1000)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  user          User           @relation(fields: [userId], references: [id])
  links         AffiliateLink[]
  commissions   Commission[]
  goals         AffiliateGoal[]
}

model AffiliateLink {
  id           Int      @id @default(autoincrement())
  affiliateId  Int
  slug         String   @unique
  urlTarget    String
  createdAt    DateTime @default(now())

  affiliate    Affiliate @relation(fields: [affiliateId], references: [id])
  clicks       Click[]
}

model Click {
  id              Int      @id @default(autoincrement())
  affiliateLinkId Int
  ip              String?
  userAgent       String?
  utm             Json?
  createdAt       DateTime @default(now())

  affiliateLink   AffiliateLink @relation(fields: [affiliateLinkId], references: [id])
}

model Attribution {
  id           Int      @id @default(autoincrement())
  userId       Int
  affiliateId  Int?
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  firstTouchAt DateTime  @default(now())
  lastTouchAt  DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id])
  affiliate    Affiliate? @relation(fields: [affiliateId], references: [id])
}

model Commission {
  id             Int              @id @default(autoincrement())
  affiliateId    Int
  userId         Int?
  transactionId  Int?
  amountCents    Int
  status         CommissionStatus @default(PENDING)
  createdAt      DateTime @default(now())
  approvedAt     DateTime?
  paidAt         DateTime?

  affiliate      Affiliate  @relation(fields: [affiliateId], references: [id])
  user           User?      @relation(fields: [userId], references: [id])
  transaction    Transaction? @relation(fields: [transactionId], references: [id])
}

model Payout {
  id            Int          @id @default(autoincrement())
  affiliateId   Int
  toUserId      Int
  amountCents   Int
  method        PayoutMethod
  status        PayoutStatus @default(PENDING)
  pixKey        String?
  bankInfo      Json?
  createdAt     DateTime     @default(now())
  paidAt        DateTime?

  affiliate     Affiliate    @relation(fields: [affiliateId], references: [id])
  toUser        User         @relation("UserPayouts", fields: [toUserId], references: [id])
}

model AffiliateGoal {
  id            Int      @id @default(autoincrement())
  affiliateId   Int
  label         String
  targetCents   Int
  monthRef      DateTime
  progressCents Int      @default(0)
  createdAt     DateTime @default(now())

  affiliate     Affiliate @relation(fields: [affiliateId], references: [id])
}

model League {
  id        Int      @id @default(autoincrement())
  optaId    String   @unique
  name      String
  country   String?
  createdAt DateTime @default(now())

  rounds    Round[]
}

model Team {
  id        Int      @id @default(autoincrement())
  optaId    String   @unique
  name      String
  shortName String?
  createdAt DateTime @default(now())
}

model Round {
  id        Int         @id @default(autoincrement())
  leagueId  Int
  optaId    String      @unique
  number    Int
  status    RoundStatus @default(OPEN)
  startsAt  DateTime?
  endsAt    DateTime?

  league    League      @relation(fields: [leagueId], references: [id])
  matches   Match[]
  usages    UserRoundUsage[]
}

model Match {
  id          Int          @id @default(autoincrement())
  optaId      String       @unique
  leagueId    Int?
  roundId     Int?
  homeTeamId  Int?
  awayTeamId  Int?
  homeTeam    String
  awayTeam    String
  score       String?
  date        DateTime
  status      String?
  stats       Json?
  createdAt   DateTime     @default(now())

  league      League?      @relation(fields: [leagueId], references: [id])
  round       Round?       @relation(fields: [roundId], references: [id])
  homeRef     Team?        @relation("homeRef", fields: [homeTeamId], references: [id])
  awayRef     Team?        @relation("awayRef", fields: [awayTeamId], references: [id])
  insights    Insight[]
}

model Insight {
  id          Int      @id @default(autoincrement())
  matchId     Int
  authorId    Int?
  title       String
  body        String
  tags        String[]
  visibility  InsightVisibility @default(PLAN_START)
  accuracy    Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  match       Match    @relation(fields: [matchId], references: [id])
  author      User?    @relation(fields: [authorId], references: [id])
}

model Notification {
  id        Int       @id @default(autoincrement())
  userId    Int
  type      String
  title     String
  body      String
  payload   Json?
  readAt    DateTime?
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
}

model SystemLog {
  id        Int       @id @default(autoincrement())
  level     LogLevel  @default(INFO)
  message   String
  context   Json?
  createdAt DateTime  @default(now())
}

model IntegrationError {
  id        Int       @id @default(autoincrement())
  provider  String
  endpoint  String?
  payload   Json?
  error     String
  createdAt DateTime  @default(now())
}

model AuditLog {
  id        Int       @id @default(autoincrement())
  actorId   Int?
  action    String
  entity    String
  entityId  String?
  diff      Json?
  createdAt DateTime  @default(now())

  actor     User?     @relation("UserAudit", fields: [actorId], references: [id])
}

```

**Comandos**

```bash
npx prisma generate
npx prisma migrate dev --name init_affiliates_plans_insights_optadomain

```

---

## 4) Config & Utilitários — Exemplos

### `config/database.ts`

```tsx
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

```

### `config/redis.ts`

```tsx
import Redis from 'ioredis';
export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  maxRetriesPerRequest: 2,
});

```

### `config/env.ts`

```tsx
export const env = {
  PORT: process.env.PORT || '4300',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OPTA_API_KEY: process.env.OPTA_API_KEY!,
  OPTA_BASE_URL: process.env.OPTA_BASE_URL || 'https://api.opta.com',
  OPTA_TIMEOUT_MS: Number(process.env.OPTA_TIMEOUT_MS || 8000),
  OPTA_RATE_LIMIT_RPS: Number(process.env.OPTA_RATE_LIMIT_RPS || 8),
  PAYMENTS_PROVIDER: process.env.PAYMENTS_PROVIDER || 'stripe',
  PAYMENTS_WEBHOOK_SECRET: process.env.PAYMENTS_WEBHOOK_SECRET || '',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
};

```

### `config/crypto.ts` (AES-GCM simplificado)

```tsx
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const key = Buffer.from(process.env.ENCRYPTION_KEY!.split(':').pop()!, 'base64');

export function encryptCPF(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptCPF(token: string) {
  const buf = Buffer.from(token, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

```

### `config/opta.ts` (rate limit + cache)

```tsx
import Bottleneck from 'bottleneck';
import fetch from 'node-fetch';
import { env } from './env';
import { redis } from './redis';

const limiter = new Bottleneck({ minTime: Math.ceil(1000 / env.OPTA_RATE_LIMIT_RPS) });

async function http(path: string) {
  const url = `${env.OPTA_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.OPTA_API_KEY}` },
    timeout: env.OPTA_TIMEOUT_MS as any,
  } as any);
  if (!res.ok) throw new Error(`OPTA ${res.status}`);
  return res.json();
}

export async function getMatchCached(optaId: string) {
  const key = `opta:match:${optaId}`;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const data = await limiter.schedule(() => http(`/matches/${optaId}`));
  const ttl = data?.status === 'live' ? 30 : 1800; // live: 30s, final: 30min
  await redis.set(key, JSON.stringify(data), { EX: ttl });
  return data;
}

```

### `utils/idempotency.ts`

```tsx
import { redis } from '../config/redis';

export async function withIdempotency(key: string, ttlSec = 600, fn: () => Promise<any>) {
  const lock = await redis.set(`idem:${key}`, '1', 'EX', ttlSec, 'NX');
  if (!lock) throw Object.assign(new Error('IDEMPOTENT_REPLAY'), { code: 'IDEMPOTENT_REPLAY' });
  try { return await fn(); } finally { /* opcional: manter chave até expirar */ }
}

```

---

## 5) Middlewares

### `middlewares/auth.ts` (esqueleto)

```tsx
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export async function auth(req: any, res: any, next: any) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.isSuspended) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

```

### `middlewares/rbac.ts`

```tsx
import { Request, Response, NextFunction } from 'express';
export function requireRole(...roles: Array<'ADMIN'|'AFFILIATE'|'USER'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

```

### `middlewares/usageFree.ts` (Scout Free 1 jogo/rodada)

```tsx
import { prisma } from '../config/database';
export function enforceFreeLimit() {
  return async (req: any, res: any, next: any) => {
    const user = req.user;
    const { roundId } = req.params;
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true }
    });
    const isFreePlan = !activeSub || activeSub.plan.name.toUpperCase() === 'FREE';
    if (!isFreePlan) return next();

    const usage = await prisma.userRoundUsage.upsert({
      where: { userId_roundId: { userId: user.id, roundId: Number(roundId) } },
      update: {},
      create: { userId: user.id, roundId: Number(roundId), usedCount: 0 }
    });

    if (usage.usedCount >= 1) {
      return res.status(402).json({
        code: 'FREE_LIMIT_REACHED',
        message: 'Limite do plano Free atingido para esta rodada. Faça upgrade para ver mais jogos.'
      });
    }

    await prisma.userRoundUsage.update({
      where: { userId_roundId: { userId: user.id, roundId: Number(roundId) } },
      data: { usedCount: { increment: 1 } }
    });
    next();
  };
}

```

### `middlewares/error.ts` (tratador central)

```tsx
export function errorHandler(err: any, _req: any, res: any, _next: any) {
  const status = err.status || 500;
  const body: any = { message: err.message || 'Internal Error' };
  if (err.code) body.code = err.code;
  return res.status(status).json(body);
}

```

---

## 6) Rotas Express (Resumo Prático)

```tsx
// app.ts (trechos)
import express from 'express';
import { auth } from './middlewares/auth';
import { requireRole } from './middlewares/rbac';
import { errorHandler } from './middlewares/error';
import { enforceFreeLimit } from './middlewares/usageFree';

const app = express();
app.use(express.json());

// Plans
app.get('/plans', plansController.list);
app.post('/admin/plans', auth, requireRole('ADMIN'), plansController.create);
app.post('/admin/coupons', auth, requireRole('ADMIN'), couponsController.upsert);

// Subscriptions
app.post('/subscriptions/checkout', auth, subscriptionsController.checkout);
app.post('/webhooks/payments', subscriptionsController.webhook); // com idempotência

// Affiliates
app.get('/affiliate/dashboard', auth, requireRole('AFFILIATE'), affiliateController.dashboard);
app.post('/affiliate/links', auth, requireRole('AFFILIATE'), affiliateController.createLink);

// Atribuição
app.post('/attribution/click/:slug', attributionController.registerClick);

// Ligas/Rodadas/Jogos/Insights
app.get('/leagues/:leagueId/rounds', roundsController.list);
app.post('/admin/rounds', auth, requireRole('ADMIN'), roundsController.upsert);
app.post('/rounds/:roundId/consume', auth, enforceFreeLimit(), (req, res) => res.json({ ok: true }));
app.get('/matches/:optaId', matchesController.getOne); // DB + cache
app.get('/matches/:matchId/insights', insightsController.list);
app.post('/admin/insights', auth, requireRole('ADMIN'), insightsController.upsert);

// Finance
app.get('/admin/finance/overview', auth, requireRole('ADMIN'), financeController.overview);

app.use(errorHandler);
export default app;

```

---

## 7) Pagamentos, Afiliados & Atribuição — Fluxos

### Assinaturas/Checkout

1. `POST /subscriptions/checkout` → cria `Subscription` (trial opcional), inicia cobrança no provedor.
2. Provedor chama `POST /webhooks/payments` com eventos (checkout/sucesso/reembolso/falha).
3. Webhook (idempotente) persiste `Transaction` + atualiza `Subscription.status`.

### Afiliados

1. **Click**: abrir link de afiliado → salva `Click` (+UTM) em `AffiliateLink.slug`.
2. **Signup**: cria `Attribution` (**first/last touch**) associando `userId` ↔ `affiliateId`.
3. **Pagamento**: evento `PAID` gera `Commission(PENDING)` calculada via `amountCents * (bps/10000)`.
4. **Aprovação** (antifraude): `Commission → APPROVED`.
5. **Payout**: criar `Payout` e marcar `Commission → PAID`.

### Cálculo de Comissão (exemplo)

```tsx
const commission = Math.round(amountCents * (affiliate.commissionBps / 10000));

```

---

## 8) Métricas Financeiras (Admin)

- **MRR/ARR**: soma de `plan.priceCents` das `Subscription` **ACTIVE**.
- **Churn**: `cancelamentos / base ativa início do período`.
- **CAC**: `(Transactions ADJUSTMENT de marketing + Commissions pagas) / novos pagantes`.

> Endpoints retornam séries mensais usando GROUP BY date_trunc('month', createdAt).
> 

**Exemplo SQL (MRR por mês)**

```sql
SELECT date_trunc('month', s.createdAt) AS mes,
       SUM(p."priceCents") AS mrr_cents
FROM "Subscription" s
JOIN "Plan" p ON p.id = s."planId"
WHERE s.status = 'ACTIVE'
GROUP BY 1
ORDER BY 1;

```

---

## 9) Opta — Ingestão & Cache

- **Leitura pontual**: `getMatchCached(optaId)` com TTL **30s** (live) ou **30min** (finalizado).
- **Ingestão incremental (worker)**: `workers/optaIngest.ts` consolida ligas/rodadas/jogos → persiste `League`, `Round`, `Match`, `Team`.
- **Fanout**: `eventsFanout.ts` emite notificações quando `Match.status/score` muda.

**Redis Keys (sugestão)**

```
opta:match:{optaId}          -> JSON do jogo (TTL dinâmico)
idem:{hash}                   -> chaves de idempotência (webhooks)
usage:{userId}:{roundId}      -> opcional se quiser espelhar UserRoundUsage

```

---

## 10) Exportações

- **CSV/XLSX**: `fast-csv` / `exceljs`.
- **PDF**: `puppeteer` renderizando `/admin/reports/:id` (HTML → PDF).

---

## 11) Segurança & LGPD

- **CPF criptografado** (AES-GCM) em repouso (util `crypto.ts`).
- **Logs sem PII**; `AuditLog` para ações sensíveis.
- **Rate limit público** (ex.: `express-rate-limit`).
- **Webhooks idempotentes** (`utils/idempotency.ts`) + validação de assinatura do provedor.
- **OpenTelemetry** (opcional) + logs estruturados.

**Erros padronizados**

| Código | HTTP | Mensagem |
| --- | --- | --- |
| `FREE_LIMIT_REACHED` | 402 | Limite do plano Free atingido nesta rodada. |
| `UNAUTHORIZED` | 401 | Token inválido/ausente. |
| `FORBIDDEN` | 403 | Sem permissão. |
| `IDEMPOTENT_REPLAY` | 409 | Requisição repetida (webhook já processado). |

---

## 12) Scripts úteis

```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "studio": "prisma studio"
  }
}

```

---

## 13) Setup & Execução

```bash
# Clonar
git clone https://github.com/seu-repo/nome-do-projeto.git
cd nome-do-projeto

# Dependências
npm install

# .env
cp .env.example .env  # e preencha as variáveis

# Prisma
npx prisma generate
npx prisma migrate dev --name init_affiliates_plans_insights_optadomain

# Dev
npm run dev

```

---

## 14) Testes & Qualidade

- **Unitários**: services/formatters/cálculo de comissão/limite Free.
- **Integração**: rotas críticas (checkout/webhook/consume).
- **Contratos**: schema de payloads da Opta (Zod/TypeBox) e webhooks.
- **Smoke**: ingestão Opta + cache Redis + leitura de match.

---

## 15) Painéis (orientação de produto)

- **Admin**: gestão de usuários, afiliados, conteúdo, planos, cupons, finanças (MRR/ARR/churn/CAC), exportações.
- **Afiliado**: links, cliques, comissões, objetivos (`AffiliateGoal`) e histórico de payouts.

---

## 16) Exemplos de Uso (cURL)

```bash
# Autenticação (exemplo fictício)
curl -H "Authorization: Bearer <JWT>" http://localhost:4300/plans

# Consumir 1 jogo Free por rodada
curl -X POST -H "Authorization: Bearer <JWT>" http://localhost:4300/rounds/123/consume

# Obter jogo da Opta (cacheado)
curl http://localhost:4300/matches/opta-abc-123

```

---

## 17) Apêndice — Dicas Operacionais

- **Pagamentos**: manter tabela `Transaction.metadata` com `eventId`/`signature` para auditoria.
- **TTL**: ajuste o TTL do cache por endpoint Opta (eventos live x pré/pós-jogo).
- **Shard Redis**: se necessário, separar `cache` e `locks` (idempotência) por prefixo.
- **RBAC**: comece com roles e evolua p/ escopos finos (claims no JWT).
- **LGPD**: disponibilize endpoint para anonimização/remoção de dados sob solicitação.

---

**Pronto.** Este documento unifica e hierarquiza todas as peças (env, schema, middlewares, Opta+Redis, rotas, afiliados, métricas, exportações e segurança) para você aplicar direto no backend atual, com mínimos ajustes de naming conforme sua regra de produto.