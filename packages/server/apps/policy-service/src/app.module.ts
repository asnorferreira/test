import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RulesModule } from './rules/rules.module';
import { ScriptsModule } from './scripts/scripts.module';
import { PillarsModule } from './pillars/pillars.module';
import { PrismaModule } from 'libs/prisma/src/prisma.module';
import { PoliciesModule } from './policies/policies.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AnalyzerModule,
    AiModule,
    FeedbackModule,
    PrismaModule,
    PillarsModule,
    PoliciesModule,
    RulesModule,
    ScriptsModule,
  ],
})
export class AppModule {}