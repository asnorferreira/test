import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { RulesEngine } from 'libs/rules-engine/src/negotiation.engine';
import { SuggestionType } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class AnalyzerService {
  private readonly prisma: PrismaService;
  private readonly logger = new Logger(AnalyzerService.name);
  private readonly helenaApiUrl = process.env.HELENA_API_URL;
  private readonly helenaApiKey = process.env.HELENA_API_KEY;

  async analyze(payload: AnalyzePayloadDto) {
    if (this.helenaApiUrl && this.helenaApiKey) {
      try {
        const endpoint = `${this.helenaApiUrl}/v1/coach/analyze`;
        this.logger.log(`Enviando payload para análise da IA Helena no endpoint: ${endpoint}`);

        const response = await axios.post(
          endpoint,
          {
            campaignId: payload.campaignId,
            conversationId: payload.conversationId,
            text: payload.lastMessage,
          },
          {
            headers: { 
              'Authorization': `Basic ${this.helenaApiKey}`,
              'Content-Type': 'application/json'
            }
          },
        );

        this.logger.log(`Análise da IA Helena recebida com sucesso para a conversa ${payload.conversationId}`);
        return response.data;

      } catch (error) {
        this.logger.error(`Erro ao comunicar com a API da Helena: ${error.message}. Usando fallback.`);
      }
    } else {
      this.logger.warn('API da Helena não configurada. Usando análise de fallback.');
    }

    return this.fallbackAnalysis(payload);
  }

  private async fallbackAnalysis(payload: AnalyzePayloadDto) {
    const activePolicy = await this.prisma.policy.findFirst({
      where: { campaignId: payload.campaignId, isActive: true },
    });

    if (!activePolicy || typeof activePolicy.body !== 'object' || activePolicy.body === null) {
      throw new NotFoundException('Política ativa não encontrada ou malformada para o fallback.');
    }
    
    const rules = (activePolicy.body as any).rules || [];
    const engine = new RulesEngine(rules);

    const suggestions = [];
    if (payload.lastMessage.toLowerCase().includes('desconto')) {
      const maxDiscount = rules[0]?.maxDiscountPercentage || 10;
      suggestions.push({
        content: `Você pode oferecer até ${maxDiscount}% de desconto.`,
        type: SuggestionType.ACTION,
      });
    }

    return {
      analysisId: `fallback-${Date.now()}`,
      suggestions,
      checklistStatus: [],
    };
  }
}

