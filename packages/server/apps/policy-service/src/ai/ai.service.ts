import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { TrainingStatus } from '@prisma/client';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HelenaChannelResponseDto, HelenaChannelType } from './dtos/helena-channel.dto';
import { HelenaChatbotListQueryDto, HelenaChatbotListResponseDto } from './dtos/helena-chatbot-query.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly helenaApiUrl = process.env.HELENA_API_URL;
  private readonly helenaApiKey = process.env.HELENA_API_KEY;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async trainCampaign(campaignId: string) {
    if (!this.helenaApiUrl || !this.helenaApiKey) {
      this.logger.error('As variáveis de ambiente HELENA_API_URL e HELENA_API_KEY devem estar configuradas.');
      return { success: false, message: 'Configuração da API da Helena está incompleta.' };
    }

    const activePolicy = await this.prisma.policy.findFirst({
      where: { campaignId, isActive: true },
    });

    if (!activePolicy) {
      throw new NotFoundException(`Nenhuma política ativa encontrada para a campanha ${campaignId} para treinar a IA.`);
    }

    await this.prisma.policy.update({
      where: { id: activePolicy.id },
      data: { trainingStatus: TrainingStatus.PENDING, lastTrainedAt: new Date() },
    });

    try {
      const endpoint = `${this.helenaApiUrl}/v1/coach/train`;
      this.logger.log(`Enviando dados de treinamento da campanha ${campaignId} (versão ${activePolicy.version}) para a Helena...`);

      await axios.post(
        endpoint,
        {
          campaignId: campaignId,
          policyVersion: activePolicy.version,
          rules: activePolicy.body, 
        },
        { headers: { 'Authorization': `Basic ${this.helenaApiKey}` } },
      );
      
      await this.prisma.policy.update({
        where: { id: activePolicy.id },
        data: { trainingStatus: TrainingStatus.COMPLETED },
      });

      this.logger.log(`Dados de treinamento da campanha ${campaignId} enviados com sucesso.`);
      return { success: true, message: `IA treinada com a política versão ${activePolicy.version}.` };
    } catch (error) {
      await this.prisma.policy.update({
        where: { id: activePolicy.id },
        data: { trainingStatus: TrainingStatus.FAILED },
      });
      this.logger.error(`Falha ao enviar dados de treinamento para a Helena: ${error.message}`);
      return { success: false, message: 'Falha na comunicação com a API da Helena.' };
    }
  }

  async getTrainingStatus(campaignId: string) {
    const activePolicy = await this.prisma.policy.findFirst({
      where: { campaignId, isActive: true },
      select: {
        version: true,
        trainingStatus: true,
        lastTrainedAt: true,
      },
    });

    if (!activePolicy) {
      throw new NotFoundException(`Nenhuma política ativa encontrada para a campanha ${campaignId}.`);
    }

    return activePolicy;
  }

  async listChannels(
    channelType: HelenaChannelType = HelenaChannelType.All,
  ): Promise<HelenaChannelResponseDto[]> {
    if (!this.helenaApiUrl || !this.helenaApiKey) {
      this.logger.error(
        'As variáveis de ambiente HELENA_API_URL e HELENA_API_KEY devem estar configuradas.',
      );
      throw new InternalServerErrorException(
        'Configuração da API da Helena está incompleta.',
      );
    }

    try {
      const endpoint = `${this.helenaApiUrl}/chat/v1/channel`;
      this.logger.log(`Buscando canais da Helena API: ${endpoint} (Tipo: ${channelType})`);

      const response = await firstValueFrom(
        this.httpService.get<HelenaChannelResponseDto[]>(endpoint, {
          headers: { Authorization: `Basic ${this.helenaApiKey}` },
          params: { ChannelType: channelType },
        }),
      );

      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : error.message;
      this.logger.error(
        `Falha ao buscar canais da Helena: ${errorMessage}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Falha na comunicação com a API da Helena para listar canais.',
      );
    }
  }

  async listChatbots(
    query: HelenaChatbotListQueryDto,
  ): Promise<HelenaChatbotListResponseDto> {
    if (!this.helenaApiUrl || !this.helenaApiKey) {
      this.logger.error(
        'As variáveis de ambiente HELENA_API_URL e HELENA_API_KEY devem estar configuradas.',
      );
      throw new InternalServerErrorException(
        'Configuração da API da Helena está incompleta.',
      );
    }

    try {
      const endpoint = `${this.helenaApiUrl}/chat/v1/chatbot`;
      this.logger.log(`Buscando chatbots da Helena API: ${endpoint}`);

      const cleanQuery = Object.fromEntries(
        Object.entries(query).filter(([, v]) => v != null),
      );

      const response = await firstValueFrom(
        this.httpService.get<HelenaChatbotListResponseDto>(endpoint, {
          headers: { Authorization: `Basic ${this.helenaApiKey}` },
          params: cleanQuery,
        }),
      );

      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : (error as Error).message;
      this.logger.error(
        `Falha ao buscar chatbots da Helena: ${errorMessage}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Falha na comunicação com a API da Helena para listar chatbots.',
      );
    }
  }
}

