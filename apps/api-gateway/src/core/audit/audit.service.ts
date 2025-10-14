import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { CreateAuditLogDto } from './dtos/create-audit-log.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data,
      });
    } catch (error) {
      this.logger.error(`Falha ao registrar log de auditoria: ${error.message}`, data);
    }
  }
}