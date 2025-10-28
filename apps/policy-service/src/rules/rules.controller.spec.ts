import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateNegotiationRuleDto } from './dtos/create-rule.dto';
import { UpdateNegotiationRuleDto } from './dtos/update-rule.dto';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Negotiation Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria uma nova regra de negociação (Acesso: ADMIN, SUPERVISOR)' })
  @ApiResponse({ status: 201, description: 'Regra criada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada.' })
  create(@Body() createRuleDto: CreateNegotiationRuleDto) {
    return this.rulesService.create(createRuleDto);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Lista todas as regras de uma campanha' })
  @ApiParam({ name: 'campaignId', description: 'ID da campanha (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de regras da campanha.' })
  findAllByCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.rulesService.findAllByCampaign(campaignId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma regra por ID' })
  @ApiParam({ name: 'id', description: 'ID da regra (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados da regra.' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Atualiza uma regra (Acesso: ADMIN, SUPERVISOR)' })
  @ApiParam({ name: 'id', description: 'ID da regra (UUID)' })
  @ApiResponse({ status: 200, description: 'Regra atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRuleDto: UpdateNegotiationRuleDto) {
    return this.rulesService.update(id, updateRuleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma regra (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID da regra (UUID)' })
  @ApiResponse({ status: 204, description: 'Regra removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Regra não encontrada.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rulesService.remove(id);
  }
}