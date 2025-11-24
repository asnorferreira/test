import { prisma } from '../../db/prismaClient';
import { IUserRepository } from '../UserRepository';
import { Role } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  findByEmail(email: string) { return prisma.user.findUnique({ where: { email } }); }
  findById(id: string) { return prisma.user.findUnique({ where: { id } }); }
  list() { return prisma.user.findMany(); }
  create(data: { name: string; email: string; passwordHash: string; role?: Role; referredById?: string | null; }) {
    return prisma.user.create({ data });
  }
}
