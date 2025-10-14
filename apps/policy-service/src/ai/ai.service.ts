import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly helenaApiUrl = process.env.HELENA_API_URL;
  private readonly helenaApiKey = process.env.HELENA_API_KEY;

  constructor(private readonly prisma: PrismaService) {}

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
      
      this.logger.log(`Dados de treinamento da campanha ${campaignId} enviados com sucesso.`);
      return { success: true, message: `IA treinada com a política versão ${activePolicy.version}.` };
    } catch (error) {
      this.logger.error(`Falha ao enviar dados de treinamento para a Helena: ${error.message}`);
      return { success: false, message: 'Falha na comunicação com a API da Helena.' };
    }
  }
}

