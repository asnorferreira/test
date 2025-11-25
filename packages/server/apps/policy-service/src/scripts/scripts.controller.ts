import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dtos/create-script.dto';
import { UpdateScriptDto } from './dtos/update-script.dto';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Scripts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Cria um novo script para uma campanha (Acesso: ADMIN, SUPERVISOR)' })
  @ApiResponse({ status: 201, description: 'Script criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada.' })
  create(@Body() createScriptDto: CreateScriptDto) {
    return this.scriptsService.create(createScriptDto);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Lista todos os scripts de uma campanha' })
  @ApiParam({ name: 'campaignId', description: 'ID da campanha (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de scripts da campanha.' })
  findAllByCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.scriptsService.findAllByCampaign(campaignId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um script por ID' })
  @ApiParam({ name: 'id', description: 'ID do script (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do script.' })
  @ApiResponse({ status: 404, description: 'Script não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.scriptsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Atualiza um script (Acesso: ADMIN, SUPERVISOR)' })
  @ApiParam({ name: 'id', description: 'ID do script (UUID)' })
  @ApiResponse({ status: 200, description: 'Script atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Script não encontrado.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateScriptDto: UpdateScriptDto) {
    return this.scriptsService.update(id, updateScriptDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um script (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do script (UUID)' })
  @ApiResponse({ status: 204, description: 'Script removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Script não encontrado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.scriptsService.remove(id);
  }
}