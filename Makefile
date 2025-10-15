# ==============================================================================
# INTERMEDIUS BACKEND - MAKEFILE
# ==============================================================================
# Este arquivo unifica os comandos mais comuns para o desenvolvimento do monorepo.
#
# Comandos disponíveis:
#   make setup          - Instala todas as dependências do projeto.
#   make start-dev      - Inicia todos os serviços em modo de desenvolvimento.
#   make start-gateway  - Inicia apenas o api-gateway.
#   make start-ingestor - Inicia apenas o ingestor.
#   make start-policy   - Inicia apenas o policy-service.
#   make build          - Compila todos os serviços para produção.
#   make test           - Roda todos os testes de unidade.
#   make test-cov       - Roda os testes e gera o relatório de cobertura.
#   make lint           - Analisa e corrige o código com ESLint.
#   make db-migrate     - Executa as migrações do Prisma.
#   make db-seed        - Popula o banco de dados com dados iniciais.
#   make db-studio      - Abre o Prisma Studio.
# ==============================================================================

# Silencia o output dos comandos
.SILENT:

# Define o NPM como gerenciador de pacotes
NPM = npm

# --- Comandos de Instalação e Setup ---
setup:
	@echo "📦 Instalando dependências..."
	$(NPM) install

# --- Comandos de Desenvolvimento ---
start-dev:
	@echo "🚀 Iniciando todos os serviços em modo de desenvolvimento..."
	$(NPM) run start:dev

start-gateway:
	@echo "🚀 Iniciando API Gateway em modo de desenvolvimento..."
	$(NPM) run start:dev:gateway

start-ingestor:
	@echo "🚀 Iniciando Ingestor em modo de desenvolvimento..."
	$(NPM) run start:dev:ingestor

start-policy:
	@echo "🚀 Iniciando Policy Service em modo de desenvolvimento..."
	$(NPM) run start:dev:policy

# --- Comandos de Build ---
build:
	@echo "📦 Compilando todos os serviços para produção..."
	$(NPM) run build:all

# --- Comandos de Teste ---
test:
	@echo "🧪 Executando testes de unidade..."
	$(NPM) run test

test-cov:
	@echo "🧪 Executando testes e gerando relatório de cobertura..."
	$(NPM) run test:cov

# --- Comandos de Qualidade de Código ---
lint:
	@echo "🎨 Analisando e corrigindo o código com ESLint..."
	$(NPM) run lint

# --- Comandos de Banco de Dados (Prisma) ---
db-migrate:
	@echo "🗄️ Executando migrações do banco de dados..."
	$(NPM) run prisma:migrate

db-seed:
	@echo "🌱 Populando o banco de dados com dados iniciais..."
	$(NPM) run seed

db-studio:
	@echo "🔍 Abrindo o Prisma Studio..."
	$(NPM) run prisma:studio

# --- Comandos do Docker ---
docker-build:
	@echo "🐳 Construindo as imagens Docker para produção..."
	docker-compose build

docker-up:
	@echo "🚀 Subindo os containers com Docker Compose..."
	docker-compose up -d

docker-down:
	@echo "🛑 Parando os containers..."
	docker-compose down

docker-logs:
	@echo "📜 Exibindo logs dos containers..."
	docker-compose logs -f

docker-restart: docker-down docker-up
	@echo "🔄 Reiniciando todos os containers..."