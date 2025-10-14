import { Module } from '@nestjs/common';
import { IngestorController } from './ingestor.controller';
import { IngestorService } from './ingestor.service';
import { N8nAdapter } from './adapters/n8n.adapter';
import { WebhookResponseStrategy } from './strategies/webhook-response.strategy';
import { N8nApiStrategy } from './strategies/n8n-api.strategy';
import { StrategyFactory } from './factories/strategy.factory';
import { ProcessEventUseCase } from './usecases/process-event.usecase';

@Module({
  imports: [],
  controllers: [IngestorController],
  providers: [
    IngestorService,
    N8nAdapter,
    WebhookResponseStrategy,
    N8nApiStrategy,
    StrategyFactory,
    ProcessEventUseCase,
  ],
})
export class IngestorModule {}
