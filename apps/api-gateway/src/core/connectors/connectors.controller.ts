import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { CreateConnectorDto } from './dtos/create-connector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { AuditService } from '../audit/audit.service';

@ApiTags('Connectors (Credenciais)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
@Controller('connectors')
export class ConnectorsController {
  constructor(
    private readonly connectorsService: ConnectorsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra uma nova credencial/conector' })
  @ApiResponse({ status: 201, description: 'Conector registrado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async create(@Body() createConnectorDto: CreateConnectorDto, @Req() req) {
    const { tenantId, id, email } = req.user;
    const connector = await this.connectorsService.create(createConnectorDto, {
      id,
      tenantId,
      role: req.user.role,
    });
    
    await this.auditService.log({
      userId: id,
      userEmail: email,
      action: 'CREATE_CONNECTOR',
      targetId: connector.id,
      tenantId: tenantId,
      details: { provider: createConnectorDto.provider, name: createConnectorDto.name }, // Nunca logar o token
    });

    return connector;
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os conectores do tenant' })
  @ApiResponse({ status: 200, description: 'Lista de conectores.' })
  async findAll(@Req() req) {
    const { tenantId, id, role } = req.user;
    return this.connectorsService.findAll({ id, tenantId, role });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma credencial/conector' })
  @ApiResponse({ status: 204, description: 'Conector removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Conector não encontrado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const { tenantId, id: userId, email, role } = req.user;

    await this.connectorsService.remove(id, { id: userId, tenantId, role });

    await this.auditService.log({
      userId: userId,
      userEmail: email,
      action: 'DELETE_CONNECTOR',
      targetId: id,
      tenantId: tenantId,
    });
  }
}
