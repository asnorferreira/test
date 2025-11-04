import { Injectable, Logger } from '@nestjs/common';
import { Pessoa, Prisma } from '@prisma/client';
import { PrismaService } from 'apps/backend/src/infrastructure/database/prisma.service';
import {
  IPessoaRepository,
  PessoaCreateInput,
  PessoaFiltro,
  PessoaUpdateInput,
} from 'apps/backend/src/interfaces/outbound/repositories/pessoa.repository.port';
import {
  PaginatedResult,
  Pagination,
  PrismaTransaction,
} from 'apps/backend/src/interfaces/outbound/repositories/base.repository.port';

@Injectable()
export class PessoaRepository implements IPessoaRepository {
  private readonly logger = new Logger(PessoaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: PrismaTransaction): PrismaTransaction | PrismaService {
    return tx || this.prisma;
  }

  async findById(id: string, tx?: PrismaTransaction): Promise<Pessoa | null> {
    const client = this.getClient(tx);
    return client.pessoa.findUnique({
      where: { id },
    });
  }

  async findByDocumento(
    documento: string,
    tx?: PrismaTransaction,
  ): Promise<Pessoa | null> {
    const client = this.getClient(tx);
    return client.pessoa.findUnique({
      where: { documento },
    });
  }

  async findAll(
    pagination: Pagination,
    filtro?: PessoaFiltro,
    tx?: PrismaTransaction,
  ): Promise<PaginatedResult<Pessoa>> {
    const client = this.getClient(tx);
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PessoaWhereInput = {};
    if (filtro?.nome) {
      where.nome = { contains: filtro.nome, mode: 'insensitive' };
    }
    if (filtro?.documento) {
      where.documento = { equals: filtro.documento };
    }
    if (filtro?.tipo) {
      where.tipo = { equals: filtro.tipo as any };
    }

    const [total, data] = await (tx || this.prisma).$transaction([
      client.pessoa.count({ where }),
      client.pessoa.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return { total, data, page, pageSize };
  }

  async create(data: PessoaCreateInput, tx?: PrismaTransaction): Promise<Pessoa> {
    const client = this.getClient(tx);
    return client.pessoa.create({
      data,
    });
  }

  async update(
    id: string,
    data: PessoaUpdateInput,
    tx?: PrismaTransaction,
  ): Promise<Pessoa> {
    const client = this.getClient(tx);
    return client.pessoa.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx?: PrismaTransaction): Promise<void> {
    const client = this.getClient(tx);
    await client.pessoa.delete({
      where: { id },
    });
  }
}