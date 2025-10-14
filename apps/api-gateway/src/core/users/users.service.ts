import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as argon2 from 'argon2';
import { User as UserModel, UserRole } from '@prisma/client';

type CurrentUser = Pick<UserModel, 'id' | 'role' | 'tenantId' | 'email'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUser: CurrentUser) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.tenantId !== createUserDto.tenantId) {
      throw new ForbiddenException('Você não tem permissão para criar usuários neste tenant.');
    }
    
    if (currentUser.role !== UserRole.ADMIN && (createUserDto.role === UserRole.ADMIN || createUserDto.tenantId !== currentUser.tenantId)) {
        throw new ForbiddenException('Acesso negado para criar este tipo de usuário.');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: createUserDto.tenantId } });
    if (!tenant) throw new BadRequestException('Tenant não encontrado.');

    const userExists = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: createUserDto.email } },
    });
    if (userExists) throw new BadRequestException('E-mail já está em uso neste tenant.');

    const passwordHash = await argon2.hash(createUserDto.password);

    return this.prisma.user.create({
      data: { ...createUserDto, passwordHash, tenantId: tenant.id },
      select: { id: true, email: true, displayName: true, role: true, status: true, createdAt: true },
    });
  }

  findAll(currentUser: CurrentUser) {
    if (currentUser.role === UserRole.ADMIN) {
      return this.prisma.user.findMany({
        select: { id: true, email: true, displayName: true, role: true, status: true, tenant: { select: { slug: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.user.findMany({
      where: { tenantId: currentUser.tenantId },
      select: { id: true, email: true, displayName: true, role: true, status: true },
      orderBy: { displayName: 'asc' },
    });
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Omit<UserModel, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    if (currentUser.role !== UserRole.ADMIN && user.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Acesso negado.');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: CurrentUser) {
    const userToUpdate = await this.findOne(id, currentUser);

    const protectedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPERVISOR];

    if (currentUser.role !== UserRole.ADMIN) {
      if (updateUserDto.role && protectedRoles.includes(updateUserDto.role)) {
        throw new ForbiddenException('Você não tem permissão para atribuir esta role.');
      }

        if (userToUpdate.id !== currentUser.id && protectedRoles.includes(userToUpdate.role)) {
        throw new ForbiddenException('Você não tem permissão para alterar este usuário.');
      }
    }


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

  async remove(id: string, currentUser: CurrentUser) {
     const userToDelete = await this.findOne(id, currentUser);
     
     if(id === currentUser.id) {
        throw new ForbiddenException('Você não pode remover a si mesmo.');
     }

     if (currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Apenas administradores podem remover usuários.');
     }
     
     if (userToDelete.role === UserRole.ADMIN) {
        throw new ForbiddenException('Não é possível remover outro administrador.');
     }

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
  }
}