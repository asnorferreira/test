import { Module } from '@nestjs/common';
import { IngestorController } from './ingestor.controller';
import { IngestorService } from './ingestor.service';

@Module({
  imports: [],
  controllers: [IngestorController],
  providers: [IngestorService],
})
export class IngestorModule {}
