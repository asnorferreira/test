# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm turbo
COPY . .
RUN pnpm install --frozen-lockfile
# Gera o client do Prisma e compila a API
RUN pnpm --filter api exec prisma generate
RUN pnpm build:api

# Estágio 2: Produção
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copia dependências e build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3333
CMD ["node", "apps/api/dist/src/main"]