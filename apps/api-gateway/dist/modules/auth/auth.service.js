"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant inválido');
        }
        const exists = await this.prisma.user.findUnique({
            where: {
                tenantId_email: {
                    tenantId: tenant.id,
                    email: dto.email,
                },
            },
        });
        if (exists) {
            throw new common_1.BadRequestException('Email já cadastrado');
        }
        const passwordHash = await argon2.hash(dto.password);
        const user = await this.prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: dto.email,
                passwordHash,
                displayName: dto.displayName,
            },
        });
        return { id: user.id };
    }
    async login(dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
        if (!tenant) {
            throw new common_1.UnauthorizedException();
        }
        const user = await this.prisma.user.findUnique({
            where: {
                tenantId_email: {
                    tenantId: tenant.id,
                    email: dto.email,
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        const ok = await argon2.verify(user.passwordHash, dto.password);
        if (!ok) {
            throw new common_1.UnauthorizedException();
        }
        const payload = { sub: user.id, tid: tenant.id, role: user.role };
        const access_token = await this.jwt.signAsync(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return { access_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map