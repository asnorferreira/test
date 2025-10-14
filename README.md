# Intermedius Coach - Backend

## Visão Geral do Projeto

O Intermedius Coach é um sistema de IA para análise e assistência em tempo real de conversas de atendimento (chat e voz). Este repositório contém o backend da solução, construído como um monorepo NestJS.

## Arquitetura

O backend é composto por três serviços principais:
- **/apps/api-gateway**: BFF (Backend for Frontend) principal, responsável por autenticação, gerenciamento de usuários e roteamento para outros serviços.
- **/apps/ingestor**: Serviço de ingestão de eventos. Recebe webhooks de plataformas de comunicação (como WTS.chat) e os publica em uma fila para processamento.
- **/apps/policy-service**: Gerencia todas as regras de negócio: pilares de qualidade, réguas de negociação, scripts e políticas de campanha.

## Tecnologias
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)

## Como Começar

### Pré-requisitos
- Node.js (v20+)
- Docker
- NPM

### Instalação
1. Clone o repositório.
2. Crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis de ambiente.
3. Instale as dependências com `npm install`.

### Executando a Aplicação
- `npm run start:dev`: Inicia todos os serviços em modo de desenvolvimento.
- `npm run prisma:migrate`: Aplica as migrações do banco de dados.
- `npm run seed`: Popula o banco com dados iniciais (tenant 'demo' e usuário admin).