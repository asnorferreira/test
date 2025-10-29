import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface DomainEvent {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  metadata: {
    conversationId: string;
    channel: string;
    returnUrl?: string;
    raw?: unknown;
    agentName?: string;
    clientName?: string;
  };
}

@Processor('conversation-events')
export class ConversationProcessor extends WorkerHost {
  private readonly logger = new Logger(ConversationProcessor.name);
  private readonly n8nWebhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
    if (!this.n8nWebhookUrl) {
      this.logger.error('N8N_WEBHOOK_URL não está configurada no .env para o worker.');
    }
  }

  async process(job: Job<DomainEvent, any, string>): Promise<any> {
    if (!this.n8nWebhookUrl) {
      this.logger.error(`[Job ${job.id}] Sem N8N_WEBHOOK_URL, pulando processamento do evento ${job.data.id}.`);
      return { status: 'skipped', reason: 'N8N_WEBHOOK_URL not configured' };
    }

    this.logger.log(`[Job ${job.id}] Processando evento ${job.data.id}. Enviando para N8N...`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.n8nWebhookUrl, job.data, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }),
      );
      this.logger.log(`[Job ${job.id}] Evento ${job.data.id} enviado ao N8N com status ${response.status}.`);
      return { status: 'success', n8nStatus: response.status };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.logger.error(`[Job ${job.id}] Erro ao enviar evento ${job.data.id} para o N8N: ${errorMessage}`);
      throw new Error(`Failed to send event ${job.data.id} to N8N: ${errorMessage}`);
    }
  }
}

