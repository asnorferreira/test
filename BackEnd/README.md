# BackEnd_Opta
src/ 📁
├─ application/ 📁               # Orquestra lógica do negócio (não conhece Express/HTTP)
│  └─ usecases/ 📁
│     ├─ CreateUser.ts 🧠        # Cria usuário (opcionalmente com referral)
│     ├─ AuthenticateUser.ts 🧠  # Login + geração de JWT
│     ├─ CreateAffiliate.ts 🧠   # Cria código de afiliado p/ um usuário
│     └─ IncrementAffiliateClick.ts 🧠 # Contabiliza clique no link de afiliado
│
├─ config/ 📁
│  └─ env.ts ⚙️                  # Carrega e valida variáveis de ambiente (.env)
│
├─ domain/ 📁                    # Coração do domínio (tipos, contratos, serviços puros)
│  ├─ dtos/ 📁
│  │  ├─ auth.ts 🧪              # Zod schemas: RegisterDTO, LoginDTO
│  │  └─ user.ts 🧪              # (reservado p/ DTOs de usuário)
│  └─ services/ 📁
│     ├─ Password.ts 🔒          # Hash/verify de senha (bcrypt)
│     └─ Token.ts 🔒             # Assina/verifica JWT
│
├─ infrastructure/ 📁            # Implementações (Prisma, adapters, repos concretos)
│  ├─ db/ 📁
│  │  └─ prismaClient.ts 🗄      # Instância do PrismaClient
│  └─ repositories/ 📁
│     ├─ UserRepository.ts 🧩    # Interface/contrato do repo de usuários
│     ├─ AffiliateRepository.ts 🧩# Interface/contrato do repo de afiliados
│     └─ impl/ 📁
│        ├─ PrismaUserRepository.ts 🏗 # Implementa IUserRepository via Prisma
│        └─ PrismaAffiliateRepository.ts 🏗 # Implementa IAffiliateRepository via Prisma
│
├─ interfaces/ 📁                # Borda do sistema (HTTP/Express)
│  └─ http/ 📁
│     ├─ middlewares/ 📁
│     │  ├─ ensureAuth.ts 🔒     # Decodifica JWT e injeta req.user
│     │  └─ ensureAdmin.ts 🔒    # Garante role ADMIN
│     ├─ controllers/ 📁
│     │  ├─ AuthController.ts 🧑‍💼   # /auth (register, login)
│     │  ├─ AdminController.ts 🧑‍💼  # /admin (CRUD básico de usuários)
│     │  └─ AffiliateController.ts 🧑‍💼 # /r/:code, criar código afiliado
│     └─ routes/ 📁
│        ├─ auth.routes.ts 🛣     # POST /auth/register | /auth/login
│        ├─ admin.routes.ts 🛣    # POST/GET /admin/users
│        └─ affiliate.routes.ts 🛣# POST / (criar código) | GET /r/:code
│
└─ main.ts 🏁                    # Bootstrap do Express, usa rotas, middlewares, etc.

prisma/ 📁
└─ seed.ts ⚙️                    # Seed do admin inicial


Fluxo da estrutura :

[Cliente HTTP]
    |
    v
[interfaces/http/routes] --- mapeia endpoint ---> [controllers]
    |                                              |
    |                                              v
    |                                       [application/usecases]
    |                                              |
    |                                              v
    |                                       [domain/services]  (hash/jwt/validações)
    |                                              |
    |                                              v
    |                                     [infrastructure/repositories]
    |                                              |
    |                                              v
    |                                        [infrastructure/db/Prisma]
    |
    v
[Resposta HTTP]
