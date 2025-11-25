import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PillarsService } from './pillars.service';
import { CreatePillarDto } from './dtos/create-pillar.dto';
import { UpdatePillarDto } from './dtos/update-pillar.dto';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Pillars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pillars')
export class PillarsController {
  constructor(private readonly pillarsService: PillarsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria um novo pilar para uma campanha (Acesso: ADMIN, SUPERVISOR)' })
  @ApiResponse({ status: 201, description: 'Pilar criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada.' })
  create(@Body() createPillarDto: CreatePillarDto) {
    return this.pillarsService.create(createPillarDto);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Lista todos os pilares de uma campanha' })
  @ApiParam({ name: 'campaignId', description: 'ID da campanha (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de pilares da campanha.' })
  findAllByCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.pillarsService.findAllByCampaign(campaignId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pilar por ID' })
  @ApiParam({ name: 'id', description: 'ID do pilar (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do pilar.' })
  @ApiResponse({ status: 404, description: 'Pilar não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pillarsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Atualiza um pilar (Acesso: ADMIN, SUPERVISOR)' })
  @ApiParam({ name: 'id', description: 'ID do pilar (UUID)' })
  @ApiResponse({ status: 200, description: 'Pilar atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pilar não encontrado.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePillarDto: UpdatePillarDto,
  ) {
    return this.pillarsService.update(id, updatePillarDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um pilar (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do pilar (UUID)' })
  @ApiResponse({ status: 204, description: 'Pilar removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Pilar não encontrado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pillarsService.remove(id);
  }
}