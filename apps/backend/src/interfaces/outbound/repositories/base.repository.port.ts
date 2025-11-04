import { Prisma } from '@prisma/client';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$commit' | '$rollback'
>;

export interface IBaseRepository<T, K extends string | number | bigint> {
  findById(
    id: K,
    tx?: PrismaTransaction,
  ): Promise<T | null>;

  findAll(
    pagination: Pagination,
    criteria?: any,
    tx?: PrismaTransaction,
  ): Promise<PaginatedResult<T>>;

  create(
    data: any,
    tx?: PrismaTransaction,
  ): Promise<T>;

  update(
    id: K,
    data: any,
    tx?: PrismaTransaction,
  ): Promise<T>;

  delete(
    id: K,
    tx?: PrismaTransaction,
  ): Promise<void>;
}