import { Controller, Post, Param, UseGuards, ParseUUIDPipe, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Training')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('train/campaign/:campaignId')
  @Roles(UserRole.ADMIN, UserRole.QA)
  @ApiOperation({ summary: 'Envia a política ativa de uma campanha para treinamento da IA (Helena).' })
  trainCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.aiService.trainCampaign(campaignId);
  }

  @Get('train/status/campaign/:campaignId')
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Verifica o status do último treinamento da política ativa de uma campanha.' })
  @ApiResponse({ status: 200, description: 'Status do treinamento retornado.' })
  @ApiResponse({ status: 404, description: 'Nenhuma política ativa encontrada.' })
  getTrainingStatus(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.aiService.getTrainingStatus(campaignId);
  }
}

