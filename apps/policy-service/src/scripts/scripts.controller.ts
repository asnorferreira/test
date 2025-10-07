import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dtos/create-script.dto';
import { UpdateScriptDto } from './dtos/update-script.dto';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  create(@Body() createScriptDto: CreateScriptDto) {
    return this.scriptsService.create(createScriptDto);
  }

  @Get('campaign/:campaignId')
  findAllByCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.scriptsService.findAllByCampaign(campaignId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.scriptsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateScriptDto: UpdateScriptDto) {
    return this.scriptsService.update(id, updateScriptDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.scriptsService.remove(id);
  }
}