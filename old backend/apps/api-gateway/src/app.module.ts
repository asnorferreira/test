import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { PrismaModule } from '../../../libs/prisma/src/prisma.module';
import { AuditModule } from './core/audit/audit.module';
import { CoachModule } from './core/coach/coach.module';
import { ReportsModule } from './core/reports/reports.module';

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
  ],
})
export class AppModule {}