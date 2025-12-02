import { Injectable } from '@nestjs/common';
import { IIamRepository } from '../../application/ports/i-iam.repository';
import { UserRole } from '@jsp/shared';
import { RegisterCandidateDto } from '../../presentation/dtos/register-candidate.dto';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { CreateStaffUserDto } from '../../presentation/dtos/create-staff-user.dto';
import { PrismaService } from '@/core/prisma/prisma.service';

@Injectable()
export class IamRepository implements IIamRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findUsersByRole(
    roles: UserRole[],
  ): Promise<Pick<User, 'email' | 'fullName'>[]> {
    return this.prisma.user.findMany({
      where: {
        role: { in: roles },
        isActive: true,
      },
      select: {
        email: true,
        fullName: true,
      },
    });
  }

  async registerCandidate(
    dto: RegisterCandidateDto,
    passwordHash: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        passwordHash: passwordHash,
        role: UserRole.CANDIDATE,
        isActive: false,
      },
    });
  }

  async createStaffUser(
    dto: CreateStaffUserDto,
    passwordHash: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        passwordHash: passwordHash,
        role: dto.role,
        isActive: true,
      },
    });
  }

  async createVerificationToken(email: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas

    await this.prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt,
      },
    });
    return token;
  }
}