import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoachGateway } from './coach.gateway';
import { SuggestionPayloadDto } from './dtos/suggestion-payload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { PrismaService } from 'libs/prisma/src/prisma.service';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coach')
export class CoachController {
  constructor(
    private readonly coachGateway: CoachGateway,
    private readonly prisma: PrismaService,
  ) {}

  @Post('conversation/:id/suggestion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envia uma nova sugestao para o frontend via WebSocket',
  })
  @ApiParam({ name: 'id', description: 'ID da conversa', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Sugestao enviada para a sala da conversa.',
  })
  handleNewSuggestion(
    @Param('id') conversationId: string,
    @Body() suggestionPayload: SuggestionPayloadDto,
  ) {
    this.coachGateway.sendSuggestion(conversationId, suggestionPayload.payload);
    return { status: 'suggestion sent' };
  }

  @Get('widget/config')
  @ApiOperation({
    summary: 'Retorna configuracoes publicas para o widget Coach',
  })
  @ApiQuery({
    name: 'tenantId',
    description: 'ID do tenant relacionado ao widget',
    required: true,
  })
  @ApiQuery({
    name: 'campaignId',
    description: 'ID da campanha que esta solicitando sugestoes',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Configuracao retornada com sucesso.',
  })
  async getWidgetConfig(
    @Query('tenantId') tenantId: string,
    @Query('campaignId') campaignId: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        widgetEnabled: true,
        defaultAiProvider: true,
        defaultAiModel: true,
      },
    });

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        aiEnabled: true,
        aiProvider: true,
        aiModel: true,
      },
    });

    return {
      tenantId,
      campaignId,
      widgetEnabled: tenant?.widgetEnabled ?? false,
      ai: {
        enabled: campaign?.aiEnabled ?? false,
        provider:
          campaign?.aiProvider ??
          tenant?.defaultAiProvider ??
          null,
        model:
          campaign?.aiModel ??
          tenant?.defaultAiModel ??
          null,
      },
    };
  }
}
