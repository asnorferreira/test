# ==============================================================================
# INTERMEDIUS BACKEND - MAKEFILE
# ==============================================================================
# Este arquivo unifica os comandos mais comuns para o desenvolvimento do monorepo.
#
# Comandos disponíveis:
#   make setup          - Instala todas as dependências do projeto.
#   make start-dev      - Inicia todos os serviços (gateway, ingestor, policy, worker) em modo dev.
#   make start-gateway  - Inicia apenas o api-gateway.
#   make start-ingestor - Inicia apenas o ingestor.
#   make start-policy   - Inicia apenas o policy-service.
#   make start-worker   - Inicia apenas o worker.
#   make build          - Compila todos os serviços para produção.
#   make test           - Roda todos os testes unitários (*.spec.ts).
#   make test-cov       - Roda os testes unitários e gera o relatório de cobertura.
#   make test-e2e       - Roda todos os testes E2E (*.e2e-spec.ts) para todos os apps.
#   make test-e2e-app app=<appName> - Roda testes E2E apenas para um app específico (ex: make test-e2e-app app=api-gateway).
#   make lint           - Analisa e corrige o código com ESLint.
#   make db-migrate     - Executa as migrações do Prisma.
#   make db-seed        - Popula o banco de dados com dados iniciais (definidos em seed.ts).
#   make db-studio      - Abre o Prisma Studio.
#   make docker-build   - Constrói as imagens Docker definidas no docker-compose.yml.
#   make docker-up      - Sobe os containers (Postgres, Redis, Apps) em modo detached.
#   make docker-down    - Para e remove os containers definidos no docker-compose.yml.
#   make docker-logs    - Exibe os logs dos containers em tempo real.
#   make docker-restart - Reinicia todos os containers.
# ==============================================================================

# Silencia o output dos comandos, exceto para echoes explícitos
.SILENT:

# Define PNPM como gerenciador de pacotes
PNPM = pnpm

# --- Comandos de Instalação e Setup ---
setup:
	@echo "📦 Instalando dependências com PNPM..."
	$(PNPM) install

# --- Comandos de Desenvolvimento ---
start-dev:
	@echo "🚀 Iniciando todos os serviços em modo de desenvolvimento (API Gateway, Ingestor, Policy Service, Worker)..."
	$(PNPM) run start:dev

start-gateway:
	@echo "🚀 Iniciando API Gateway em modo de desenvolvimento..."
	$(PNPM) run start:dev:gateway

start-ingestor:
	@echo "🚀 Iniciando Ingestor em modo de desenvolvimento..."
	$(PNPM) run start:dev:ingestor

start-policy:
	@echo "🚀 Iniciando Policy Service em modo de desenvolvimento..."
	$(PNPM) run start:dev:policy

start-worker:
	@echo "🚀 Iniciando Worker em modo de desenvolvimento..."
	$(PNPM) run start:dev:worker

# --- Comandos de Build ---
build:
	@echo "📦 Compilando todos os serviços para produção..."
	$(PNPM) run build:all

# --- Comandos de Teste ---
test:
	@echo "🧪 Executando testes unitários (*.spec.ts)..."
	$(PNPM) run test

test-cov:
	@echo "🧪 Executando testes unitários e gerando relatório de cobertura..."
	$(PNPM) run test:cov

test-e2e:
	@echo "🚦 Executando TODOS os testes End-to-End (*.e2e-spec.ts)..."
	$(PNPM) run test:e2e

# Permite rodar E2E para um app específico: make test-e2e-app app=api-gateway
test-e2e-app:
	@echo "🚦 Executando testes End-to-End para o app: $(app)..."
	@[ "${app}" ] || ( echo "Erro: Especifique o app. Ex: make test-e2e-app app=api-gateway"; exit 1 )
	$(PNPM) run test:e2e:$(app)

# --- Comandos de Qualidade de Código ---
lint:
	@echo "🎨 Analisando e corrigindo o código com ESLint..."
	$(PNPM) run lint

# --- Comandos de Banco de Dados (Prisma) ---
db-migrate:
	@echo "🗄️ Executando migrações do banco de dados (Prisma)..."
	$(PNPM) run prisma:migrate

db-seed:
	@echo "🌱 Populando o banco de dados com dados iniciais (libs/prisma/seeds/seed.ts)..."
	$(PNPM) run seed

db-studio:
	@echo "🔍 Abrindo o Prisma Studio..."
	$(PNPM) run prisma:studio

# --- Comandos do Docker ---
docker-build:
	@echo "🐳 Construindo as imagens Docker para produção (usando docker-compose.yml)..."
	docker-compose build

docker-up:
	@echo "🚀 Subindo os containers (Postgres, Redis, Apps) com Docker Compose em modo detached..."
	docker-compose up -d

docker-down:
	@echo "🛑 Parando e removendo os containers definidos no docker-compose.yml..."
	docker-compose down

docker-logs:
	@echo "📜 Exibindo logs dos containers em tempo real (Ctrl+C para sair)..."
	docker-compose logs -f

docker-restart: docker-down docker-up
	@echo "🔄 Reiniciando todos os containers Docker..."

.PHONY: setup start-dev start-gateway start-ingestor start-policy start-worker build test test-cov test-e2e test-e2e-app lint db-migrate db-seed db-studio docker-build docker-up docker-down docker-logs docker-restart