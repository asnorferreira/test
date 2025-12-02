import { Module } from '@nestjs/common';
import { CorePrismaModule } from '@/core/prisma/prisma.module';
import { CoreStorageModule } from '@/core/storage/storage.module';
import { IamModule } from '@/modules/iam/iam.module';
import { ProfilesModule } from '@/modules/profiles/profiles.module';
import { ITalentPoolRepository } from './application/ports/i-talent-pool.repository';
import { TalentPoolRepository } from './infrastructure/adapters/talent-pool.repository';
import { SubmitToTalentPoolUseCase } from './application/use-cases/submit-to-talent-pool.use-case';
import { GetMySubmissionsUseCase } from './application/use-cases/get-my-submissions.use-case';
import { TalentPoolController } from './infrastructure/talent-pool.controller';
import { ConfigModule } from '@nestjs/config';
import { TalentPoolRhController } from './infrastructure/talent-pool-rh.controller';
import { GetTalentPoolUseCase } from './application/use-cases/get-talent-pool.use-case';
import { GetSubmissionDetailsUseCase } from './application/use-cases/get-submission-details.use-case';
import { UpdateSubmissionStatusUseCase } from './application/use-cases/update-submission-status.use-case';
import { ExportSubmissionsUseCase } from './application/use-cases/export-submissions.use-case';
import { PublicTalentPoolController } from './infrastructure/public-talent-pool.controller';
import { PublicJobApplicationUseCase } from './application/use-cases/public-job-application.use-case';

const useCases = [
  // Candidato
  SubmitToTalentPoolUseCase,
  GetMySubmissionsUseCase,
  // RH/Gestor
  GetTalentPoolUseCase,
  GetSubmissionDetailsUseCase,
  UpdateSubmissionStatusUseCase,
  ExportSubmissionsUseCase,
  // Público
  PublicJobApplicationUseCase,
];

const repositories = [
  {
    provide: ITalentPoolRepository,
    useClass: TalentPoolRepository,
  },
];

@Module({
  imports: [
    ConfigModule,
    CorePrismaModule,
    CoreStorageModule, 
    IamModule,       
    ProfilesModule,
  ],
  controllers: [
    TalentPoolController,
    TalentPoolRhController,
    PublicTalentPoolController,
  ],
  providers: [...useCases, ...repositories],
})
export class TalentPoolModule {}