-- CreateTable
CREATE TABLE "EventoOffline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payload" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "enviado" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "CredencialCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pessoaId" TEXT NOT NULL,
    "pessoaNome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "vigenciaFim" DATETIME,
    "pontoAcessoIds" TEXT,
    "horarios" TEXT,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "EventoOffline_enviado_timestamp_idx" ON "EventoOffline"("enviado", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "CredencialCache_valor_key" ON "CredencialCache"("valor");

-- CreateIndex
CREATE INDEX "CredencialCache_valor_status_idx" ON "CredencialCache"("valor", "status");

-- CreateIndex
CREATE INDEX "CredencialCache_lastUpdate_idx" ON "CredencialCache"("lastUpdate");
