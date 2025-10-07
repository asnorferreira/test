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
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard'; // Ajuste o caminho conforme sua estrutura
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard'; // Ajuste o caminho
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator'; // Ajuste o caminho
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pillars')
export class PillarsController {
  constructor(private readonly pillarsService: PillarsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  create(@Body() createPillarDto: CreatePillarDto) {
    return this.pillarsService.create(createPillarDto);
  }

  @Get('campaign/:campaignId')
  findAllByCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.pillarsService.findAllByCampaign(campaignId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pillarsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePillarDto: UpdatePillarDto,
  ) {
    return this.pillarsService.update(id, updatePillarDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pillarsService.remove(id);
  }
}