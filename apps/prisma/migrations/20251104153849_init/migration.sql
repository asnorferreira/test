-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('MORADOR', 'VISITANTE', 'FUNCIONARIO', 'PRESTADOR_SERVICO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "TipoCredencial" AS ENUM ('FACIAL', 'BIOMETRIA', 'UHF', 'QR_CODE', 'CARTAO_PROXIMIDADE', 'SENHA');

-- CreateEnum
CREATE TYPE "StatusCredencial" AS ENUM ('ATIVA', 'INATIVA', 'BLOQUEADA', 'EXPIRADA', 'PENDENTE_CADASTRO');

-- CreateEnum
CREATE TYPE "FabricanteDispositivo" AS ENUM ('ZKTECO', 'PPA', 'IMECONTRON', 'CONTROL_ID', 'INTELBRAS', 'HIKVISION', 'IDFLEX', 'IDUHF', 'IDFACE', 'GENERICO_ONVIF', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoPontoAcesso" AS ENUM ('CATRACA_PEDESTRE', 'CANCELARIA_VEICULAR', 'PORTAO_GARAGEM', 'PORTA_SOCIAL', 'ELEVADOR');

-- CreateEnum
CREATE TYPE "DirecaoPontoAcesso" AS ENUM ('ENTRADA', 'SAIDA', 'AMBOS');

-- CreateEnum
CREATE TYPE "AcaoEvento" AS ENUM ('ENTRADA', 'SAIDA', 'ACIONAMENTO_MANUAL', 'TENTATIVA_INVALIDA', 'DISPOSITIVO_OFFLINE', 'ALARME_COACAO');

-- CreateEnum
CREATE TYPE "ResultadoEvento" AS ENUM ('PERMITIDO', 'NEGADO', 'NEGADO_ANTI_PASSBACK', 'NEGADO_CREDENCIAL_INVALIDA', 'NEGADO_CREDENCIAL_EXPIRADA', 'NEGADO_LISTA_BLOQUEIO', 'ERRO_COMUNICACAO', 'ERRO_DISPOSITIVO');

-- CreateEnum
CREATE TYPE "PerfilOperador" AS ENUM ('PORTARIA', 'SINDICO', 'ADMIN_TI', 'INTEGRADOR', 'ROOT');

-- CreateEnum
CREATE TYPE "StatusLicenca" AS ENUM ('ATIVA', 'EXPIRADA', 'PENDENTE', 'BLOQUEADA', 'MODO_GRACA');

-- CreateEnum
CREATE TYPE "ModuloLicenca" AS ENUM ('CORE_ACESSO', 'VISITANTES', 'FACIAL', 'UHF', 'RELATORIOS_AVANCADOS', 'EDGE_OFFLINE');

-- CreateEnum
CREATE TYPE "StatusDispositivo" AS ENUM ('ONLINE', 'OFFLINE', 'EM_MANUTENCAO', 'COM_FALHA');

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoPessoa" NOT NULL,
    "unidade" TEXT,
    "documento" TEXT,
    "contatos" JSONB,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credencial" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "tipo" "TipoCredencial" NOT NULL,
    "status" "StatusCredencial" NOT NULL DEFAULT 'PENDENTE_CADASTRO',
    "valor" VARCHAR(512),
    "vigenciaInicio" TIMESTAMP(3),
    "vigenciaFim" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credencial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fabricante" "FabricanteDispositivo" NOT NULL,
    "modelo" TEXT,
    "ip" TEXT NOT NULL,
    "porta" INTEGER NOT NULL,
    "driver" TEXT NOT NULL,
    "status" "StatusDispositivo" NOT NULL DEFAULT 'OFFLINE',
    "capabilities" JSONB,
    "portariaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PontoDeAcesso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoPontoAcesso" NOT NULL,
    "direcao" "DirecaoPontoAcesso" NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "channelNaControladora" INTEGER DEFAULT 0,
    "portariaId" TEXT NOT NULL,
    "politicas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PontoDeAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoDeAcesso" (
    "id" BIGSERIAL NOT NULL,
    "pessoaId" TEXT,
    "credencialId" TEXT,
    "pontoId" TEXT NOT NULL,
    "acao" "AcaoEvento" NOT NULL,
    "resultado" "ResultadoEvento" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "snapshotUri" VARCHAR(512),
    "meta" JSONB,

    CONSTRAINT "EventoDeAcesso_pkey" PRIMARY KEY ("id","dataHora")
);

-- CreateTable
CREATE TABLE "Instalacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instalacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portaria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "instalacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licenca" (
    "id" TEXT NOT NULL,
    "instalacaoId" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "validade" TIMESTAMP(3) NOT NULL,
    "boundInfo" JSONB NOT NULL,
    "status" "StatusLicenca" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicencaModuloMap" (
    "id" TEXT NOT NULL,
    "licencaId" TEXT NOT NULL,
    "modulo" "ModuloLicenca" NOT NULL,

    CONSTRAINT "LicencaModuloMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operador" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "claims" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperadorPerfilMap" (
    "id" TEXT NOT NULL,
    "operadorId" TEXT NOT NULL,
    "perfil" "PerfilOperador" NOT NULL,

    CONSTRAINT "OperadorPerfilMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "operadorId" TEXT,
    "operadorNome" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "justificativa" TEXT,
    "recursoTipo" TEXT,
    "recursoId" TEXT,
    "dadosAntigos" JSONB,
    "dadosNovos" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_documento_key" ON "Pessoa"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Credencial_valor_key" ON "Credencial"("valor");

-- CreateIndex
CREATE INDEX "Credencial_pessoaId_idx" ON "Credencial"("pessoaId");

-- CreateIndex
CREATE INDEX "Credencial_tipo_status_idx" ON "Credencial"("tipo", "status");

-- CreateIndex
CREATE INDEX "Dispositivo_portariaId_idx" ON "Dispositivo"("portariaId");

-- CreateIndex
CREATE INDEX "PontoDeAcesso_dispositivoId_idx" ON "PontoDeAcesso"("dispositivoId");

-- CreateIndex
CREATE INDEX "PontoDeAcesso_portariaId_idx" ON "PontoDeAcesso"("portariaId");

-- CreateIndex
CREATE INDEX "EventoDeAcesso_dataHora_pontoId_idx" ON "EventoDeAcesso"("dataHora", "pontoId");

-- CreateIndex
CREATE INDEX "EventoDeAcesso_pessoaId_dataHora_idx" ON "EventoDeAcesso"("pessoaId", "dataHora");

-- CreateIndex
CREATE INDEX "EventoDeAcesso_pontoId_idx" ON "EventoDeAcesso"("pontoId");

-- CreateIndex
CREATE INDEX "EventoDeAcesso_credencialId_idx" ON "EventoDeAcesso"("credencialId");

-- CreateIndex
CREATE UNIQUE INDEX "Instalacao_nome_key" ON "Instalacao"("nome");

-- CreateIndex
CREATE INDEX "Portaria_instalacaoId_idx" ON "Portaria"("instalacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_instalacaoId_key" ON "Licenca"("instalacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Licenca_chave_key" ON "Licenca"("chave");

-- CreateIndex
CREATE INDEX "LicencaModuloMap_licencaId_idx" ON "LicencaModuloMap"("licencaId");

-- CreateIndex
CREATE UNIQUE INDEX "LicencaModuloMap_licencaId_modulo_key" ON "LicencaModuloMap"("licencaId", "modulo");

-- CreateIndex
CREATE UNIQUE INDEX "Operador_authUserId_key" ON "Operador"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Operador_email_key" ON "Operador"("email");

-- CreateIndex
CREATE INDEX "OperadorPerfilMap_operadorId_idx" ON "OperadorPerfilMap"("operadorId");

-- CreateIndex
CREATE UNIQUE INDEX "OperadorPerfilMap_operadorId_perfil_key" ON "OperadorPerfilMap"("operadorId", "perfil");

-- CreateIndex
CREATE INDEX "Auditoria_operadorId_idx" ON "Auditoria"("operadorId");

-- CreateIndex
CREATE INDEX "Auditoria_recursoTipo_recursoId_idx" ON "Auditoria"("recursoTipo", "recursoId");

-- CreateIndex
CREATE INDEX "Auditoria_timestamp_idx" ON "Auditoria"("timestamp");

-- AddForeignKey
ALTER TABLE "Credencial" ADD CONSTRAINT "Credencial_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_portariaId_fkey" FOREIGN KEY ("portariaId") REFERENCES "Portaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PontoDeAcesso" ADD CONSTRAINT "PontoDeAcesso_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "Dispositivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PontoDeAcesso" ADD CONSTRAINT "PontoDeAcesso_portariaId_fkey" FOREIGN KEY ("portariaId") REFERENCES "Portaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoDeAcesso" ADD CONSTRAINT "EventoDeAcesso_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoDeAcesso" ADD CONSTRAINT "EventoDeAcesso_credencialId_fkey" FOREIGN KEY ("credencialId") REFERENCES "Credencial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoDeAcesso" ADD CONSTRAINT "EventoDeAcesso_pontoId_fkey" FOREIGN KEY ("pontoId") REFERENCES "PontoDeAcesso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portaria" ADD CONSTRAINT "Portaria_instalacaoId_fkey" FOREIGN KEY ("instalacaoId") REFERENCES "Instalacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licenca" ADD CONSTRAINT "Licenca_instalacaoId_fkey" FOREIGN KEY ("instalacaoId") REFERENCES "Instalacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicencaModuloMap" ADD CONSTRAINT "LicencaModuloMap_licencaId_fkey" FOREIGN KEY ("licencaId") REFERENCES "Licenca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperadorPerfilMap" ADD CONSTRAINT "OperadorPerfilMap_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "Operador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "Operador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
