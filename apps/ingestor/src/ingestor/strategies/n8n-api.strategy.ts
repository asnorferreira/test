import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from './strategy.interface';
import { DomainEvent } from '../dto/domain-event.dto';
import axios from 'axios';

@Injectable()
export class N8nApiStrategy implements Strategy {
  private readonly logger = new Logger(N8nApiStrategy.name);
  private readonly n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  async handle(event: DomainEvent): Promise<void> {
    if (!this.n8nWebhookUrl) {
      this.logger.error('N8N_WEBHOOK_URL não está configurada no .env');
      return;
    }

    this.logger.log(`Enviando evento ${event.id} para o webhook do N8N.`);
    
    try {
      await axios.post(this.n8nWebhookUrl, event, {
        headers: { 'Content-Type': 'application/json' },
      });
      this.logger.log(`Evento ${event.id} enviado com sucesso para o N8N.`);
    } catch (error) {
      this.logger.error(`Erro ao enviar evento para o N8N: ${error.message}`);
    }
  }
}