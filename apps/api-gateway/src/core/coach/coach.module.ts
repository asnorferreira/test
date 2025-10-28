import { Module } from '@nestjs/common';
import { CoachGateway } from './coach.gateway';
import { CoachController } from './coach.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CoachGateway],
  controllers: [CoachController],
  exports: [CoachGateway],
})
export class CoachModule {}
