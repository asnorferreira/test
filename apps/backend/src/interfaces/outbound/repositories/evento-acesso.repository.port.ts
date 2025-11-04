import {
  EventoDeAcesso,
  Prisma,
  ResultadoEvento,
} from '@prisma/client';
import {
  PaginatedResult,
  Pagination,
  PrismaTransaction,
} from './base.repository.port';

export type EventoAcessoCreateInput = Omit<
  Prisma.EventoDeAcessoCreateInput,
  'pontoDeAcesso' | 'pessoa' | 'credencial'
> & {
  pontoId: string;
  pessoaId?: string;
  credencialId?: string;
};

export interface EventoFiltro {
  dataInicio: Date;
  dataFim: Date;
  pontoId?: string;
  pessoaId?: string;
  resultado?: ResultadoEvento;
}

export interface IEventoAcessoRepository {
  append(
    data: EventoAcessoCreateInput,
    tx?: PrismaTransaction,
  ): Promise<EventoDeAcesso>;

  findById(
    id: bigint,
    tx?: PrismaTransaction,
  ): Promise<EventoDeAcesso | null>;

  query(
    filter: EventoFiltro,
    pagination: Pagination,
    tx?: PrismaTransaction,
  ): Promise<PaginatedResult<EventoDeAcesso>>;
}

export const IEventoAcessoRepository = Symbol('IEventoAcessoRepository');