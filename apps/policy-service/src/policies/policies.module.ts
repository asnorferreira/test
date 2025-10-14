import { Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { AuthModule } from 'apps/api-gateway/src/core/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PoliciesController],
  providers: [PoliciesService],
})
export class PoliciesModule {}
