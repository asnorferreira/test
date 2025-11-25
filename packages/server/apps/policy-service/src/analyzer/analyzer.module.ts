import { Module } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { AnalyzerController } from './analyzer.controller';
import { RulesEngine } from 'libs/rules-engine/src';

@Module({
  controllers: [AnalyzerController],
  providers: [AnalyzerService, RulesEngine],
})
export class AnalyzerModule {}
