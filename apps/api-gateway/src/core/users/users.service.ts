import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: createUserDto.tenantSlug },
    });
    if (!tenant) {
      throw new BadRequestException('Tenant não encontrado.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        tenantId_email: { tenantId: tenant.id, email: createUserDto.email },
      },
    });
    if (userExists) {
      throw new BadRequestException('E-mail já está em uso neste tenant.');
    }

    const passwordHash = await argon2.hash(createUserDto.password);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        passwordHash,
        tenantId: tenant.id,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        tenant: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      data.passwordHash = await argon2.hash(updateUserDto.password);
      delete data.password;
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, role: true, status: true },
      });
    } catch (error) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    return;
  }
}