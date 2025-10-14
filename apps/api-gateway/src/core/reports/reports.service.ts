import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { DashboardQueryDto } from './dtos/dashboard-query.dto';

type CurrentUser = { id: string; tenantId: string; role: UserRole; };

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(query: DashboardQueryDto, currentUser: CurrentUser) {
    const tenantId = currentUser.role === UserRole.ADMIN ? query.tenantId : currentUser.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID é necessário para esta consulta.');
    }

    const whereClause = {
      tenantId: tenantId,
      completedAt: {
        gte: query.startDate,
        lte: query.endDate,
      },
    };

    const aggregations = await this.prisma.conversationAnalysis.aggregate({
      where: whereClause,
      _avg: {
        finalScore: true,
        adherenceRate: true,
      },
      _count: {
        _all: true,
      },
    });

    return {
      totalConversations: aggregations._count._all,
      averageScore: aggregations._avg.finalScore,
      averageAdherence: aggregations._avg.adherenceRate,
    };
  }

  async getAuditLogs(currentUser: CurrentUser, tenantId?: string) {
    if (currentUser.role !== UserRole.ADMIN) {
      return this.prisma.auditLog.findMany({
        where: { tenantId: currentUser.tenantId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    return this.prisma.auditLog.findMany({
      where: {
        tenantId: tenantId, 
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}