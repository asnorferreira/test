import { Module } from '@nestjs/common';
import { CorePrismaModule } from '@/core/prisma/prisma.module';
import { CommercialController } from './infrastructure/commercial.controller';
import { CreateProposalUseCase } from './application/use-cases/create-proposal.use-case';
import { CommercialRepository } from './infrastructure/adapters/commercial.repository';

@Module({
  imports: [CorePrismaModule],
  controllers: [CommercialController],
  providers: [
    CreateProposalUseCase,
    CommercialRepository,
  ],
})
export class CommercialModule {}