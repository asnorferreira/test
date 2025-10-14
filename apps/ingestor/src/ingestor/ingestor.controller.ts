import { Body, Controller, HttpCode, HttpStatus, Post, ValidationPipe, Logger } from '@nestjs/common';
import { IngestorService } from './ingestor.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { N8nAdapter } from './adapters/n8n.adapter';
import { eventBus } from './events/event-bus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Ingestor')
@Controller('ingestor')
export class IngestorController {
  private readonly logger = new Logger(IngestorController.name);

  constructor(
    private readonly ingestorService: IngestorService,
    private readonly adapter: N8nAdapter,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Recebe eventos de canais externos (WhatsApp, Voz, etc.)' })
  @ApiResponse({ status: 202, description: 'Evento recebido e enfileirado para processamento.' })
  @ApiResponse({ status: 400, description: 'Payload do evento inválido.' })
  async handleWebhook(@Body(new ValidationPipe()) webhookEvent: WebhookEventDto) {
    try {
      // 1) Normaliza o payload via Adapter
      const domainEvent = this.adapter.toDomain(webhookEvent);

      // 2) Publica no EventBus para ser consumido por UseCase/Strategies
      eventBus.publish('conversation.event', domainEvent);

      // 3) Mantém processamento anterior se necessário (suporta sync/async)
      await Promise.resolve(this.ingestorService.processEvent(webhookEvent));

      this.logger.log(`Evento recebido e publicado: ${domainEvent.id}`);
      return { status: 'event received' };
    } catch (err) {
      this.logger.error('Erro ao processar webhook', (err as Error).message);
      // 202 para não travar retries do n8n; 
      return { status: 'error', message: (err as Error).message };
    }
  }
}