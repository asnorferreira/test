import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IEventoAcessoRepository } from 'apps/backend/src/interfaces/outbound/repositories/evento-acesso.repository.port';
import { EventoAcessoRepository } from 'apps/backend/src/adapters/outbound/persistence/evento-acesso.repository';
import { IPessoaRepository } from 'apps/backend/src/interfaces/outbound/repositories/pessoa.repository.port';
import { PessoaRepository } from 'apps/backend/src/adapters/outbound/persistence/pessoa.repository';
import { PartitionService } from './jobs/partition.service';

const REPOSITORIES = [
  {
    provide: IEventoAcessoRepository,
    useClass: EventoAcessoRepository,
  },
  {
    provide: IPessoaRepository,
    useClass: PessoaRepository,
  },
  // TODO: Adicionar outros repositórios (Dispositivo, PontoDeAcesso, etc)
];

@Module({
  providers: [PrismaService, PartitionService, ...REPOSITORIES],
  exports: [PrismaService, PartitionService, ...REPOSITORIES],
})
export class DatabaseModule {}