import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/repositories/user.repository";
import { User } from "../domain/entities/user.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { UserRole } from "@maemais/shared-types";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.props.name,
        email: user.props.email,
        cpf: user.props.cpf,
        phone: user.props.phone,
        passwordHash: user.props.passwordHash,
        role: user.props.role,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  private mapToDomain(raw: any): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        cpf: raw.cpf,
        phone: raw.phone,
        passwordHash: raw.passwordHash,
        role: raw.role as UserRole,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
