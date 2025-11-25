import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestorModule } from './ingestor/ingestor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    IngestorModule,
  ],
})
export class AppModule {}