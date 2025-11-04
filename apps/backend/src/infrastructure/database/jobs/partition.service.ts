import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const TABLE_NAME = 'EventoDeAcesso';
const PARTITION_PREFIX = 'evento_acesso_';
const LOOKAHEAD_MONTHS = 2;

@Injectable()
export class PartitionService {
  private readonly logger = new Logger(PartitionService.name);

  constructor(private readonly prisma: PrismaService) {}
  async ensurePartitions(): Promise<void> {
    this.logger.log('Iniciando verificação de partições de eventos...');

    try {
      const now = new Date();
      for (let i = 0; i < LOOKAHEAD_MONTHS; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        await this.createPartitionIfNotExists(targetDate);
      }
      this.logger.log('Verificação de partições concluída.');
    } catch (error) {
      this.logger.error('Erro ao garantir partições', error);
    }
  }

  private async createPartitionIfNotExists(date: Date): Promise<void> {
    const { partitionName, dateFrom, dateTo } =
      this.getPartitionDetails(date);

    const exists = await this.checkIfPartitionExists(partitionName);

    if (exists) {
      this.logger.log(`Partição ${partitionName} já existe. Pulando.`);
      return;
    }

    this.logger.log(
      `Criando partição ${partitionName} para o range: ${dateFrom} até ${dateTo}`,
    );

    const sql = `
      CREATE TABLE IF NOT EXISTS "${partitionName}"
      PARTITION OF "${TABLE_NAME}"
      FOR VALUES FROM ('${dateFrom}') TO ('${dateTo}');
    `;

    try {
      await this.prisma.$executeRawUnsafe(sql);
      this.logger.log(`Partição ${partitionName} criada com sucesso.`);
    } catch (error) {
      this.logger.error(
        `Falha ao criar partição ${partitionName}. SQL: ${sql}`,
        error.stack,
      );
      if (error.code !== '42P07') {
        throw error;
      }
    }
  }

  private getPartitionDetails(date: Date): {
    partitionName: string;
    dateFrom: string;
    dateTo: string;
  } {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01-12

    const nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = (nextMonthDate.getMonth() + 1)
      .toString()
      .padStart(2, '0');

    return {
      partitionName: `${PARTITION_PREFIX}${year}_${month}`,
      dateFrom: `${year}-${month}-01T00:00:00Z`,
      dateTo: `${nextYear}-${nextMonth}-01T00:00:00Z`,
    };
  }

  private async checkIfPartitionExists(
    partitionName: string,
  ): Promise<boolean> {
    const result: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT EXISTS (
         SELECT 1
         FROM   pg_catalog.pg_class c
         JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
         WHERE  c.relname = $1
         AND    n.nspname = 'public'
       );`,
      partitionName,
    );

    return result[0]?.exists || false;
  }

  // TODO: Implementar Job de arquivamento/movimentação (Fase 2.4 - ETL)
  async archiveOldPartitions(monthsToKeep: number): Promise<void> {
    this.logger.warn(
      `[ETL] Função de arquivamento (archiveOldPartitions) não implementada.`,
    );
  }
}