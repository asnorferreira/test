import { Body, Controller, HttpCode, HttpStatus, Post, ValidationPipe } from '@nestjs/common';
import { IngestorService } from './ingestor.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Ingestor')
@Controller('ingestor')
export class IngestorController {
  constructor(private readonly ingestorService: IngestorService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Recebe eventos de canais externos (WhatsApp, Voz, etc.)' })
  @ApiResponse({ status: 202, description: 'Evento recebido e enfileirado para processamento.' })
  @ApiResponse({ status: 400, description: 'Payload do evento inválido.' })
  handleWebhook(@Body(new ValidationPipe()) webhookEvent: WebhookEventDto) {
    this.ingestorService.processEvent(webhookEvent);
    return { status: 'event received' };
  }
}