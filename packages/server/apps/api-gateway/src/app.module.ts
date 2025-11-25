import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { PrismaModule } from '../../../libs/prisma/src/prisma.module';
import { AuditModule } from './core/audit/audit.module';
import { CoachModule } from './core/coach/coach.module';
import { ReportsModule } from './core/reports/reports.module';
import { CampaignsModule } from './core/campaigns/campaigns.module';
import { ConnectorsModule } from './core/connectors/connectors.module';
import { HealthController } from './core/health/health.controller';
import { SnippetController } from './core/snippet/snippet.controller';
import { CryptoModule } from 'libs/crypto/crypto.module';
import { TenantSettingsModule } from './core/tenant-settings/tenant-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    CoachModule,
    ReportsModule,
    CampaignsModule,
    ConnectorsModule,
    TenantSettingsModule,
    CryptoModule,
  ],
  controllers: [
    HealthController,
    SnippetController,
  ]
})
export class AppModule {}
