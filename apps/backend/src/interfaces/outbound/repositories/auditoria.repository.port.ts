import { Auditoria, Prisma } from '@prisma/client';
import { PrismaTransaction } from './base.repository.port';

export type AuditoriaCreateInput = Omit<
  Prisma.AuditoriaCreateInput,
  'operador'
> & {
  operadorId?: string;
  operadorNome: string;
};

export interface IAuditoriaRepository {
  create(
    data: AuditoriaCreateInput,
    tx?: PrismaTransaction,
  ): Promise<Auditoria>;
}

export const IAuditoriaRepository = Symbol('IAuditoriaRepository');