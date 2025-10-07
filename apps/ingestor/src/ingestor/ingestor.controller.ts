import { Body, Controller, HttpCode, HttpStatus, Post, ValidationPipe } from '@nestjs/common';
import { IngestorService } from './ingestor.service';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Controller('ingestor')
export class IngestorController {
  constructor(private readonly ingestorService: IngestorService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  handleWebhook(@Body(new ValidationPipe()) webhookEvent: WebhookEventDto) {
    this.ingestorService.processEvent(webhookEvent);
    
    return { status: 'event received' };
  }
}