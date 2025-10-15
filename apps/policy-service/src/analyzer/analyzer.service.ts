import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { RulesEngine } from 'libs/rules-engine/src/negotiation.engine';
import { SuggestionType, Pillar } from '@prisma/client';
import axios from 'axios';
import { AnalyzeResponseDto, ChecklistItemDto, ChecklistItemStatus, SuggestionDto } from './dtos/analyze-response.dto'; // Importando novos DTOs

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);
  private readonly helenaApiUrl = process.env.HELENA_API_URL;
  private readonly helenaApiKey = process.env.HELENA_API_KEY;

  constructor(private readonly prisma: PrismaService) {}

  async analyze(payload: AnalyzePayloadDto): Promise<AnalyzeResponseDto> {
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
        return response.data as AnalyzeResponseDto; 

      } catch (error) {
        this.logger.error(`Erro ao comunicar com a API da Helena: ${(error as Error).message}. Usando fallback.`);
      }
    } else {
      this.logger.warn('API da Helena não configurada. Usando análise de fallback.');
    }
    
    return this.fallbackAnalysis(payload);
  }

  private async fallbackAnalysis(payload: AnalyzePayloadDto): Promise<AnalyzeResponseDto> {
    const activePolicy = await this.prisma.policy.findFirst({
      where: { campaignId: payload.campaignId, isActive: true },
      include: { 
          campaign: {
              include: {
                  pillars: true
              }
          }
      }
    });

    if (!activePolicy || typeof activePolicy.body !== 'object' || activePolicy.body === null) {
      throw new NotFoundException('Política ativa não encontrada ou malformada para o fallback.');
    }
    
    const pillars = (activePolicy.campaign?.pillars || []) as Pillar[];
    const rules = (activePolicy.body as any).rules || [];

    const engine = new RulesEngine(rules); 

    const checklist: ChecklistItemDto[] = pillars.map(p => ({
        name: p.name,
        status: ChecklistItemStatus.PENDING,
        reason: p.description,
    }));
    
    if (pillars.length > 0 && payload.lastMessage.toLowerCase().includes('olá')) {
        checklist[0].status = ChecklistItemStatus.COMPLETED;
        checklist[0].reason = `Saudação detectada na mensagem: "${payload.lastMessage.substring(0, 50)}..."`;
    }

    const suggestions: SuggestionDto[] = [];
    let alert: string | undefined = undefined;

    if (payload.lastMessage.toLowerCase().includes('desconto')) {
      const maxDiscount = rules.find((r: any) => r.maxDiscountPercentage !== undefined)?.maxDiscountPercentage || 10;
      suggestions.push({
        content: `Atenção: Limite máximo de ${maxDiscount}% de desconto.`,
        type: SuggestionType.ALERT,
      });
      suggestions.push({
        content: `Proponha o desconto: "Podemos considerar um desconto especial de até ${maxDiscount}% para fechar hoje!"`,
        type: SuggestionType.ACTION,
      });
    }

    if (payload.lastMessage.toLowerCase().includes('fechar') || payload.lastMessage.toLowerCase().includes('finalizar')) {
        alert = 'AVISO: Não esqueça de confirmar o envio da Nota Fiscal e o prazo de entrega com o cliente!';
        suggestions.push({
            content: 'SCRIPT: "Excelente! Para finalizarmos, o prazo de entrega é de 5 dias úteis e a nota fiscal será enviada por e-mail em até 48h."',
            type: SuggestionType.SCRIPT,
        });
    }

    return {
      analysisId: `fallback-${Date.now()}`,
      checklist,
      suggestions,
      alert,
    } as AnalyzeResponseDto;
  }
}

