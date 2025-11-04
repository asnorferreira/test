import { Pessoa, Prisma } from '@prisma/client';
import {
  IBaseRepository,
  PaginatedResult,
  Pagination,
  PrismaTransaction,
} from './base.repository.port';

export type PessoaCreateInput = Prisma.PessoaCreateInput;
export type PessoaUpdateInput = Prisma.PessoaUpdateInput;

export interface PessoaFiltro {
  nome?: string;
  documento?: string;
  tipo?: string;
}

export interface IPessoaRepository
  extends IBaseRepository<Pessoa, string> {
  findByDocumento(
    documento: string,
    tx?: PrismaTransaction,
  ): Promise<Pessoa | null>;

  findAll(
    pagination: Pagination,
    filtro?: PessoaFiltro,
    tx?: PrismaTransaction,
  ): Promise<PaginatedResult<Pessoa>>;
}

export const IPessoaRepository = Symbol('IPessoaRepository');