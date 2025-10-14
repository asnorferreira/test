import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RulesModule } from './rules/rules.module';
import { ScriptsModule } from './scripts/scripts.module';
import { PillarsModule } from './pillars/pillars.module';
import { PrismaModule } from 'libs/prisma/src/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PillarsModule,
    RulesModule,
    ScriptsModule,
  ],
})
export class AppModule {}