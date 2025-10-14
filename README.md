# Intermedius Coach - Backend

## Visão Geral do Projeto

O Intermedius Coach é um sistema de IA para análise e assistência em tempo real de conversas de atendimento (chat e voz). Ele se conecta a plataformas de comunicação como o WhatsApp, monitora as interações e fornece aos atendentes checklists, sugestões e alertas para garantir a qualidade e a conformidade do atendimento. Este repositório contém o backend da solução, construído como um monorepo NestJS.

## Arquitetura

O backend é composto por três serviços principais e um fluxo de dados orquestrado pelo N8N:

-   **/apps/api-gateway**: O BFF (Backend for Frontend) principal. É responsável por:
    -   Autenticação e autorização de usuários (JWT).
    -   Gerenciamento de usuários, tenants e campanhas.
    -   Servir como gateway WebSocket para comunicação em tempo real com o frontend (extensão do navegador).
    -   Expor endpoints para o frontend consumir os dados processados pela IA.

-   **/apps/ingestor**: Serviço de ingestão de eventos. Sua função é:
    -   Receber webhooks de plataformas externas (ex: WTS.chat).
    -   Normalizar os eventos para um formato de domínio padrão.
    -   Publicar os eventos em um fluxo do N8N para processamento assíncrono.

-   **/apps/policy-service**: Gerencia todas as regras de negócio e configurações:
    -   CRUD de Pilares de qualidade.
    -   CRUD de Réguas de negociação (limites de desconto, parcelamento).
    -   CRUD de Scripts e material de apoio.
    -   Fornece as regras para o N8N e a IA analisarem as conversas.

-   **N8N (Orquestrador)**: Atua como o middleware que conecta os serviços e a IA.
    1.  Recebe o evento de conversa do `ingestor`.
    2.  Busca as regras de negócio aplicáveis no `policy-service`.
    3.  Envia o contexto da conversa + regras para a API da Helena (IA).
    4.  Recebe a análise da Helena.
    5.  Envia o resultado para o `api-gateway` para ser distribuído em tempo real.

## Tecnologias
-   **Framework**: NestJS
-   **Linguagem**: TypeScript
-   **ORM**: Prisma
-   **Banco de Dados**: PostgreSQL (com schema multi-tenant)
-   **Autenticação**: JWT (JSON Web Tokens)
-   **Comunicação em Tempo Real**: WebSockets
-   **Orquestração e IA**: N8N, API Helena

## Como Começar

### Pré-requisitos
-   Node.js (v20+)
-   Docker e Docker Compose
-   NPM (v9+)

### Instalação
1.  Clone o repositório: `git clone https://github.com/Ranmdom/Intermedius-BackEnd.git`
2.  Navegue até a pasta do projeto: `cd Intermedius-BackEnd`
3.  Crie um arquivo `.env` a partir do `.env.example` e preencha todas as variáveis de ambiente.
4.  Instale as dependências: `npm install`

### Executando a Aplicação
1.  **Suba o banco de dados:**
    ```bash
    docker-compose up -d
    ```
2.  **Aplique as migrações do Prisma:**
    ```bash
    npm run db-migrate
    ```
3.  **Popule o banco com dados iniciais (cria o tenant 'demo' e o usuário ADMIN):**
    ```bash
    npm run db-seed
    ```
4.  **Inicie todos os serviços em modo de desenvolvimento:**
    ```bash
    npm run start-dev
    ```

-   **API Gateway**: `http://localhost:3000/api/docs`
-   **Ingestor**: `http://localhost:3001/api/docs`
-   **Policy Service**: `http://localhost:3002/api/docs`