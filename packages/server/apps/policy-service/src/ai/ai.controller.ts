import { Controller, Post, Param, UseGuards, ParseUUIDPipe, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HelenaChannelResponseDto, HelenaChannelType } from './dtos/helena-channel.dto';
import { HelenaChatbotListQueryDto, HelenaChatbotListResponseDto } from './dtos/helena-chatbot-query.dto';

@ApiTags('AI Training & Config')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('train/campaign/:campaignId')
  @Roles(UserRole.ADMIN, UserRole.QA)
  @ApiOperation({ summary: 'Envia a política ativa de uma campanha para treinamento da IA (Helena).' })
  async trainCampaign(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.aiService.trainCampaign(campaignId);
  }

  @Get('train/status/campaign/:campaignId')
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Verifica o status do último treinamento da política ativa de uma campanha.' })
  @ApiResponse({ status: 200, description: 'Status do treinamento retornado.' })
  @ApiResponse({ status: 404, description: 'Nenhuma política ativa encontrada.' })
  async getTrainingStatus(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.aiService.getTrainingStatus(campaignId);
  }

  @Get('channels')
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Lista os canais de atendimento configurados na Helena API.',
    description: 'Endpoint para buscar os canais (ex: WhatsApp) disponíveis na plataforma de IA.',
  })
  @ApiQuery({
    name: 'channelType',
    enum: HelenaChannelType,
    required: false,
    description: 'Filtra o tipo de canal.',
    example: HelenaChannelType.Whatsapp,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de canais retornada com sucesso.',
    type: [HelenaChannelResponseDto],
  })
  @ApiResponse({ status: 500, description: 'Falha na comunicação com a API da Helena.' })
  async getChannels(
    @Query('channelType') channelType?: HelenaChannelType,
  ): Promise<HelenaChannelResponseDto[]> {
    return this.aiService.listChannels(channelType);
  }

  @Get('chatbots')
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Lista os chatbots (IA Brains) configurados na Helena API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de chatbots retornada com sucesso.',
    type: HelenaChatbotListResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Falha na comunicação com a API da Helena.',
  })
  async getChatbots(
    @Query() query: HelenaChatbotListQueryDto,
  ): Promise<HelenaChatbotListResponseDto> {
    return this.aiService.listChatbots(query);
  }
}

