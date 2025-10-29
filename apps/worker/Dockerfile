# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY libs/prisma/schema.prisma ./libs/prisma/schema.prisma
RUN pnpm fetch
RUN pnpm install -r --offline

# ---- Build ----
FROM base AS build
ARG appName=worker
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# Gera as dependências do Prisma
RUN pnpm prisma:generate
# Constrói o worker
RUN pnpm --filter=$appName build

# ---- Production ----
FROM node:20-alpine AS production
ARG appName=worker
WORKDIR /usr/src/app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /usr/src/app/dist ./dist
# Copia o schema e o cliente gerado do Prisma
COPY --from=build --chown=appuser:appgroup /usr/src/app/libs/prisma ./libs/prisma
COPY --from=build --chown=appuser:appgroup /usr/src/app/node_modules/.prisma ./node_modules/.prisma

USER appuser
# O comando de start é apenas o node, pois este app não "ouve" uma porta
CMD node dist/apps/$appName/main.js
