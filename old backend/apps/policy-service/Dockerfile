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
ARG appName=policy-service
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm --filter=$appName build

# ---- Production ----
FROM node:20-alpine AS production
ARG appName=policy-service
WORKDIR /usr/src/app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /usr/src/app/dist ./dist
COPY --chown=appuser:appgroup libs/prisma/schema.prisma ./libs/prisma/schema.prisma
USER appuser
CMD node dist/apps/$appName/main.js