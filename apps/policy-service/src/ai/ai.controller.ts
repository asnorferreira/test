import { Controller, Post, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
}

