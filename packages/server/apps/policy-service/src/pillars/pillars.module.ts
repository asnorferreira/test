import { Module } from '@nestjs/common';
import { PillarsController } from './pillars.controller';
import { PillarsService } from './pillars.service';

@Module({
  controllers: [PillarsController],
  providers: [PillarsService]
})
export class PillarsModule {}
