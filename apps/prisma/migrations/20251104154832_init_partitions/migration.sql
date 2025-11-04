-- prisma/migrations/[timestamp]_init_partitions/migration.sql (CORRIGIDO)

-- 1. Remover a tabela "EventoDeAcesso" simples criada pelo Prisma
DROP TABLE IF EXISTS "EventoDeAcesso";

-- 2. Criar a tabela "EventoDeAcesso" PARTICIONADA (PostgreSQL)
CREATE TABLE "EventoDeAcesso" (
  "id" BIGSERIAL NOT NULL,
  "pessoaId" TEXT NULL,
  "credencialId" TEXT NULL,
  "pontoId" TEXT NOT NULL,
  "acao" "AcaoEvento" NOT NULL,
  "resultado" "ResultadoEvento" NOT NULL,
  "dataHora" TIMESTAMP(3) NOT NULL,
  "snapshotUri" VARCHAR(512) NULL,
  "meta" JSONB NULL,
  CONSTRAINT "EventoDeAcesso_pkey" PRIMARY KEY ("id", "dataHora"),
  CONSTRAINT "EventoDeAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EventoDeAcesso_credencialId_fkey" FOREIGN KEY ("credencialId") REFERENCES "Credencial"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EventoDeAcesso_pontoId_fkey" FOREIGN KEY ("pontoId") REFERENCES "PontoDeAcesso"("id") ON DELETE CASCADE ON UPDATE CASCADE -- <<< CORREÇÃO AQUI
) PARTITION BY RANGE ("dataHora");

-- 3. Criar os índices (Otimizados para Fase 2.3)
CREATE INDEX "EventoDeAcesso_dataHora_pontoId_idx" ON "EventoDeAcesso" ("dataHora" DESC, "pontoId");
CREATE INDEX "EventoDeAcesso_pessoaId_dataHora_idx" ON "EventoDeAcesso" ("pessoaId", "dataHora" DESC);
CREATE INDEX "EventoDeAcesso_pontoId_idx" ON "EventoDeAcesso" ("pontoId");
CREATE INDEX "EventoDeAcesso_credencialId_idx" ON "EventoDeAcesso" ("credencialId");

-- 4. Criar a partição para o mês atual (Exemplo)
-- (O Job de Rotação (Fase 2.4) cuidará disso automaticamente)
CREATE TABLE "evento_acesso_2025_11" PARTITION OF "EventoDeAcesso"
    FOR VALUES FROM ('2025-11-01 00:00:00') TO ('2025-12-01 00:00:00');

-- 5. Criar a partição para o próximo mês (Exemplo)
CREATE TABLE "evento_acesso_2025_12" PARTITION OF "EventoDeAcesso"
    FOR VALUES FROM ('2025-12-01 00:00:00') TO ('2026-01-01 00:00:00');