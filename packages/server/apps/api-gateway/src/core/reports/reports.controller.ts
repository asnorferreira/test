import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardQueryDto } from './dtos/dashboard-query.dto';
import { QualityQueryDto } from './dtos/quality-query.dto';

@ApiTags('Reports & BI')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.QA)
  @ApiOperation({ summary: 'Obtém métricas consolidadas para o dashboard.' })
  @ApiResponse({ status: 200, description: 'Métricas retornadas com sucesso.' })
  getDashboardMetrics(@Query() query: DashboardQueryDto, @Req() req) {
    return this.reportsService.getDashboardMetrics(query, req.user);
  }

  @Get('audit')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lista os últimos logs de auditoria.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filtra por ID do tenant (apenas para ADMINs).' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria retornados.' })
  getAuditLogs(@Req() req, @Query('tenantId') tenantId?: string) {
    return this.reportsService.getAuditLogs(req.user, tenantId);
  }

  @Get('quality')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.QA)
  @ApiOperation({
    summary: 'Lista os snapshots de coaching para auditoria de QA.',
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshots retornados com sucesso.',
  })
  getCoachingSnapshots(@Query() query: QualityQueryDto, @Req() req) {
    return this.reportsService.getCoachingSnapshots(query, req.user);
  }
}
