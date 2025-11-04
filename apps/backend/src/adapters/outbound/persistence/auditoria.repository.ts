import { Injectable } from '@nestjs/common';
import { Auditoria } from '@prisma/client';
import { PrismaService } from 'apps/backend/src/infrastructure/database/prisma.service';
import {
  IAuditoriaRepository,
  AuditoriaCreateInput,
} from 'apps/backend/src/interfaces/outbound/repositories/auditoria.repository.port';
import { PrismaTransaction } from 'apps/backend/src/interfaces/outbound/repositories/base.repository.port';

@Injectable()
export class AuditoriaRepository implements IAuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getClient(tx?: PrismaTransaction): PrismaTransaction | PrismaService {
    return tx || this.prisma;
  }

  async create(
    data: AuditoriaCreateInput,
    tx?: PrismaTransaction,
  ): Promise<Auditoria> {
    const client = this.getClient(tx);
    return client.auditoria.create({
      data: data as any,
    });
  }
}