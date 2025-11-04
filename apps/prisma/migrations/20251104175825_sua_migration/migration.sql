-- DropIndex
DROP INDEX "EventoDeAcesso_dataHora_pontoId_idx";

-- DropIndex
DROP INDEX "EventoDeAcesso_pessoaId_dataHora_idx";

-- CreateIndex
CREATE INDEX "EventoDeAcesso_dataHora_pontoId_idx" ON "EventoDeAcesso"("dataHora", "pontoId");

-- CreateIndex
CREATE INDEX "EventoDeAcesso_pessoaId_dataHora_idx" ON "EventoDeAcesso"("pessoaId", "dataHora");
