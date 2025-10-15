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
      const domainEvent = this.adapter.toDomain(webhookEvent);

      eventBus.publish('conversation.event', domainEvent);

      await Promise.resolve(this.ingestorService.processEvent(webhookEvent));

      this.logger.log(`Evento recebido e publicado: ${domainEvent.id}`);
      return { status: 'event received' };
    } catch (err) {
      this.logger.error('Erro ao processar webhook', (err as Error).message);
      return { status: 'error', message: (err as Error).message };
    }
  }
}