import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto, RegisterDto } from './dtos'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto): Promise<{ id: string }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } })
    if (!tenant) {
      throw new BadRequestException('Tenant inválido')
    }

    const exists = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email,
        },
      },
    })

    if (exists) {
      throw new BadRequestException('Email já cadastrado')
    }

    const passwordHash = await argon2.hash(dto.password)
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
      },
    })

    return { id: user.id }
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } })
    if (!tenant) {
      throw new UnauthorizedException()
    }

    const user = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email,
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException()
    }

    const ok = await argon2.verify(user.passwordHash, dto.password)
    if (!ok) {
      throw new UnauthorizedException()
    }

    const payload = { sub: user.id, tid: tenant.id, role: user.role }
    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    return { access_token }
  }
}
