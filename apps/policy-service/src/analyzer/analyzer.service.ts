import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { RulesEngine } from 'libs/rules-engine/src/negotiation.engine';
import { SuggestionType } from '@prisma/client';

@Injectable()
export class AnalyzerService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(payload: AnalyzePayloadDto) {
    const activePolicy = await this.prisma.policy.findFirst({
      where: { campaignId: payload.campaignId, isActive: true },
    });

    if (!activePolicy || typeof activePolicy.body !== 'object' || activePolicy.body === null) {
      throw new NotFoundException('Política ativa não encontrada ou malformada.');
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

