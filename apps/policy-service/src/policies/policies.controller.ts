import { Controller, Get, Param, Post, Req, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublishPolicyResponseDto } from './dtos/publish-policy.dto';

@ApiTags('Policies')
@ApiBearerAuth()
@Controller('policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post('campaign/:campaignId/publish')
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publica uma nova versão da política da campanha.' })
  @ApiResponse({ status: 201, description: 'Política publicada com sucesso.', type: PublishPolicyResponseDto })
  publish(@Param('campaignId', ParseUUIDPipe) campaignId: string, @Req() req) {
    return this.policiesService.publish(campaignId, req.user.email);
  }

  @Get('campaign/:campaignId/active')
  @ApiOperation({ summary: 'Obtém a política ativa de uma campanha.' })
  @ApiResponse({ status: 200, description: 'Política ativa retornada.', type: PublishPolicyResponseDto })
  findActive(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.policiesService.findActiveByCampaign(campaignId);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Lista todas as versões de políticas de uma campanha.' })
  @ApiResponse({ status: 200, description: 'Lista de políticas.', type: [PublishPolicyResponseDto] })
  findAll(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.policiesService.findAllByCampaign(campaignId);
  }
}
