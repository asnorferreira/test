import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { Pillar, SuggestionType } from '@prisma/client';
import axios from 'axios';
import {
  AnalyzeResponseDto,
  ChecklistItemDto,
  ChecklistItemStatus,
  SuggestionDto,
} from './dtos/analyze-response.dto';

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);
  private readonly helenaApiUrl = process.env.HELENA_API_URL;
  private readonly helenaApiKey = process.env.HELENA_API_KEY;

  constructor(private readonly prisma: PrismaService) {}

  async analyze(payload: AnalyzePayloadDto): Promise<AnalyzeResponseDto> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: payload.campaignId },
      select: {
        id: true,
        aiEnabled: true,
        aiProvider: true,
        aiModel: true,
        tenant: {
          select: {
            id: true,
            widgetEnabled: true,
            defaultAiProvider: true,
            defaultAiModel: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha nao encontrada para analise.');
    }

    const resolvedAiProvider =
      campaign.aiProvider ?? campaign.tenant?.defaultAiProvider ?? null;
    const resolvedAiModel =
      campaign.aiModel ?? campaign.tenant?.defaultAiModel ?? null;

    const shouldUseExternalAi =
      campaign.aiEnabled && !!this.helenaApiUrl && !!this.helenaApiKey;

    let analysisResponse: AnalyzeResponseDto;

    if (shouldUseExternalAi) {
      try {
        const endpoint = `${this.helenaApiUrl}/v1/coach/analyze`;
        this.logger.log(
          `Enviando payload para analise externa (${resolvedAiProvider ?? 'desconhecido'}) no endpoint: ${endpoint}`,
        );

        const response = await axios.post(
          endpoint,
          {
            campaignId: payload.campaignId,
            conversationId: payload.conversationId,
            text: payload.lastMessage,
            aiProvider: resolvedAiProvider,
            aiModel: resolvedAiModel,
          },
          {
            headers: {
              Authorization: `Basic ${this.helenaApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        this.logger.log(
          `Analise retornada com sucesso para a conversa ${payload.conversationId}`,
        );
        analysisResponse = response.data as AnalyzeResponseDto;
      } catch (error) {
        this.logger.error(
          `Erro ao comunicar com a API de analise externa: ${
            (error as Error).message
          }. Usando fallback local.`,
        );
        analysisResponse = await this.fallbackAnalysis(payload);
      }
    } else {
      this.logger.warn(
        `IA desativada para a campanha ${payload.campaignId} ou credenciais ausentes. Usando fallback local.`,
      );
      analysisResponse = await this.fallbackAnalysis(payload);
    }

    await this.saveCoachingSnapshot(
      payload.conversationId,
      payload.campaignId,
      analysisResponse,
    );

    return analysisResponse;
  }

  private async fallbackAnalysis(
    payload: AnalyzePayloadDto,
  ): Promise<AnalyzeResponseDto> {
    const activePolicy = await this.prisma.policy.findFirst({
      where: { campaignId: payload.campaignId, isActive: true },
      include: {
        campaign: {
          include: {
            pillars: true,
          },
        },
      },
    });

    if (
      !activePolicy ||
      typeof activePolicy.body !== 'object' ||
      activePolicy.body === null
    ) {
      throw new NotFoundException(
        'Politica ativa nao encontrada ou malformada para o fallback.',
      );
    }

    const pillars = (activePolicy.campaign?.pillars || []) as Pillar[];
    const rules = (activePolicy.body as any).rules || [];

    const checklist: ChecklistItemDto[] = pillars.map((p) => ({
      name: p.name,
      status: ChecklistItemStatus.PENDING,
      reason: p.description,
    }));

    if (
      pillars.length > 0 &&
      payload.lastMessage.toLowerCase().includes('ola')
    ) {
      checklist[0].status = ChecklistItemStatus.COMPLETED;
      checklist[0].reason = `Saudacao detectada na mensagem: "${payload.lastMessage.substring(
        0,
        50,
      )}..."`;
    }

    const suggestions: SuggestionDto[] = [];
    let alert: string | undefined = undefined;

    if (payload.lastMessage.toLowerCase().includes('desconto')) {
      const maxDiscount =
        rules.find((r: any) => r.maxDiscountPercentage !== undefined)
          ?.maxDiscountPercentage || 10;
      suggestions.push({
        content: `Atencao: limite maximo de ${maxDiscount}% de desconto.`,
        type: SuggestionType.ALERT,
      });
      suggestions.push({
        content:
          `Sugestao: "Podemos considerar um desconto especial de ate ${maxDiscount}% para fechar hoje!"`,
        type: SuggestionType.ACTION,
      });
    }

    if (
      payload.lastMessage.toLowerCase().includes('fechar') ||
      payload.lastMessage.toLowerCase().includes('finalizar')
    ) {
      alert =
        'Aviso: nao esqueça de confirmar nota fiscal e prazo de entrega com o cliente.';
      suggestions.push({
        content:
          'Script: "Excelente! Para finalizarmos, o prazo de entrega e de 5 dias uteis e a nota fiscal sera enviada por e-mail em ate 48h."',
        type: SuggestionType.SCRIPT,
      });
    }

    const fallbackResponse: AnalyzeResponseDto = {
      analysisId: `fallback-${Date.now()}`,
      checklist,
      suggestions,
      alert,
    };

    return fallbackResponse;
  }

  private async saveCoachingSnapshot(
    conversationExternalId: string,
    campaignId: string,
    payload: AnalyzeResponseDto,
  ) {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { tenantId: true },
      });

      if (!campaign) {
        this.logger.warn(
          `Campanha ${campaignId} nao encontrada. Pulando salvamento do snapshot.`,
        );
        return;
      }

      const conversation = await this.prisma.conversation.upsert({
        where: {
          campaignId_externalId: {
            campaignId: campaignId,
            externalId: conversationExternalId,
          },
        },
        create: {
          externalId: conversationExternalId,
          campaignId: campaignId,
          tenantId: campaign.tenantId,
          channel: 'unknown',
        },
        update: {},
        select: { id: true },
      });

      await this.prisma.coachingSnapshot.create({
        data: {
          conversationId: conversation.id,
          payload: payload as any,
        },
      });
      this.logger.log(`Snapshot salvo para conversa ${conversationExternalId}`);
    } catch (error) {
      this.logger.error(
        `Falha ao salvar snapshot para conversa ${conversationExternalId}: ${
          (error as Error).message
        }`,
      );
    }
  }
}
