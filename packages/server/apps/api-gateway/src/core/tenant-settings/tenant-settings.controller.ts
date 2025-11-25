import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateTenantSettingsDto } from './dtos/update-tenant-settings.dto';
import { TenantSettingsService } from './tenant-settings.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@/ts-shared';

@ApiTags('Tenant Settings')
@ApiBearerAuth()
@Controller('tenant-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
export class TenantSettingsController {
  constructor(
    private readonly tenantSettingsService: TenantSettingsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Recupera as configuracoes do tenant atual.' })
  @ApiResponse({ status: 200, description: 'Configuracoes retornadas com sucesso.' })
  async getSettings(@Req() req) {
    const { tenantId } = req.user;
    return this.tenantSettingsService.getSettings(tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Atualiza configuracoes de IA e widget do tenant.' })
  @ApiResponse({ status: 200, description: 'Configuracoes atualizadas.' })
  async updateSettings(@Body() dto: UpdateTenantSettingsDto, @Req() req) {
    const actor = req.user;
    const targetTenantId =
      dto.tenantId && actor.role === UserRole.ADMIN
        ? dto.tenantId
        : actor.tenantId;

    const { tenantId: _ignoredTenantId, ...payload } = dto;
    const updated = await this.tenantSettingsService.updateSettings(
      targetTenantId,
      payload,
    );

    await this.auditService.log({
      userId: actor.id,
      userEmail: actor.email,
      action: 'UPDATE_TENANT_SETTINGS',
      targetId: targetTenantId,
      tenantId: actor.tenantId,
      details: payload,
    });

    return updated;
  }
}
