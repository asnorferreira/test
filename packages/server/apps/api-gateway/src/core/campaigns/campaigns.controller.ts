import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dtos/create-campaign.dto';
import { UpdateCampaignDto } from './dtos/update-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { AuditService } from '../audit/audit.service';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria uma nova campanha (Acesso: ADMIN, SUPERVISOR)' })
  @ApiResponse({ status: 201, description: 'Campanha criada com sucesso.' })
  async create(@Body() createCampaignDto: CreateCampaignDto, @Req() req) {
    const campaign = await this.campaignsService.create(createCampaignDto, req.user);
    
    await this.auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CREATE_CAMPAIGN',
      targetId: campaign.id,
      tenantId: req.user.tenantId,
      details: createCampaignDto,
    });

    return campaign;
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as campanhas do tenant' })
  @ApiResponse({ status: 200, description: 'Lista de campanhas.' })
  findAll(@Req() req) {
    return this.campaignsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma campanha por ID' })
  @ApiParam({ name: 'id', description: 'ID da campanha (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados da campanha.' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.campaignsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Atualiza uma campanha (Acesso: ADMIN, SUPERVISOR)' })
  @ApiParam({ name: 'id', description: 'ID da campanha (UUID)' })
  @ApiResponse({ status: 200, description: 'Campanha atualizada com sucesso.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Req() req,
  ) {
    const campaign = await this.campaignsService.update(id, updateCampaignDto, req.user);
    
    await this.auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'UPDATE_CAMPAIGN',
      targetId: campaign.id,
      tenantId: req.user.tenantId,
      details: updateCampaignDto,
    });

    return campaign;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove uma campanha (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID da campanha (UUID)' })
  @ApiResponse({ status: 204, description: 'Campanha removida com sucesso.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    await this.campaignsService.remove(id, req.user);
    
    await this.auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DELETE_CAMPAIGN',
      targetId: id,
      tenantId: req.user.tenantId,
    });
  }
}
