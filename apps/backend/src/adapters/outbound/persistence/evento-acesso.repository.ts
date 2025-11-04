import { Injectable, Logger } from '@nestjs/common';
import { EventoDeAcesso, Prisma } from '@prisma/client';
import { PrismaService } from 'apps/backend/src/infrastructure/database/prisma.service';
import {
  EventoAcessoCreateInput,
  EventoFiltro,
  IEventoAcessoRepository,
} from 'apps/backend/src/interfaces/outbound/repositories/evento-acesso.repository.port';
import {
  PaginatedResult,
  Pagination,
  PrismaTransaction,
} from 'apps/backend/src/interfaces/outbound/repositories/base.repository.port';

@Injectable()
export class EventoAcessoRepository implements IEventoAcessoRepository {
  private readonly logger = new Logger(EventoAcessoRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: PrismaTransaction): PrismaTransaction | PrismaService {
    return tx || this.prisma;
  }

  async append(
    data: EventoAcessoCreateInput,
    tx?: PrismaTransaction,
  ): Promise<EventoDeAcesso> {
    const client = this.getClient(tx);
    try {
      return await client.eventoDeAcesso.create({
        data: data as any,
      });
    } catch (error) {
      this.logger.error('Erro ao anexar evento de acesso', error);
      throw error;
    }
  }

  async findById(
    id: bigint,
    tx?: PrismaTransaction,
  ): Promise<EventoDeAcesso | null> {
    const client = this.getClient(tx);
    return client.eventoDeAcesso.findFirst({
      where: { id },
    });
  }

  async query(
    filter: EventoFiltro,
    pagination: Pagination,
    tx?: PrismaTransaction,
  ): Promise<PaginatedResult<EventoDeAcesso>> {
    const client = this.getClient(tx);
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const where: Prisma.EventoDeAcessoWhereInput = {
      dataHora: {
        gte: filter.dataInicio,
        lte: filter.dataFim,
      },
    };

    if (filter.pontoId) {
      where.pontoId = filter.pontoId;
    }
    if (filter.pessoaId) {
      where.pessoaId = filter.pessoaId;
    }
    if (filter.resultado) {
      where.resultado = filter.resultado;
    }

    const [total, data] = await (tx || this.prisma).$transaction([
      client.eventoDeAcesso.count({ where }),
      client.eventoDeAcesso.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { dataHora: 'desc' },
      }),
    ]);

    return { total, data, page, pageSize };
  }
}