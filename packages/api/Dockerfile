FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia os arquivos de manifesto do monorepo
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copia os package.json de todos os pacotes
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/

# Instala todas as dependências do monorepo
RUN pnpm install --frozen-lockfile --prod=false

# Copia todo o código-fonte
COPY . .

# Constrói o pacote 'api' e seus dependentes ('shared')
RUN pnpm --filter @jsp/api... build


# --- Estágio 2: Runner ---
# Cria a imagem final apenas com o necessário para rodar a API
FROM node:20-alpine AS runner

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia os manifests de dependência da API e Shared
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/

# Instala SOMENTE dependências de produção da API
RUN pnpm install --filter @jsp/api... --prod --frozen-lockfile

# Copia os artefatos construídos do estágio 'builder'
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copia o Prisma schema e o cliente gerado
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expõe a porta
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["pnpm", "--filter", "@jsp/api", "start"]