import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestWinstonFactory } from './winston-logger.factory';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from 'apps/backend/src/infrastructure/database/prisma.service';
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: Logger,
      errorLogStyle: 'pretty',
    }),
  ],
  providers: [
    {
      provide: Logger,
      useFactory: (configService: ConfigService) => {
        const appName = configService.get<string>('app.appName', {
          infer: true,
        });
        return NestWinstonFactory(appName);
      },
      inject: [ConfigService],
    },
    PrismaHealthIndicator,
    PrismaService,
  ],
  controllers: [HealthController],
  exports: [Logger],
})
export class ObservabilityModule {}