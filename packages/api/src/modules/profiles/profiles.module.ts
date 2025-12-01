import { Module } from '@nestjs/common';
import { IProfilesRepository } from './application/ports/i-profiles.repository';
import { GetCandidateProfileUseCase } from './application/use-cases/get-candidate-profile.use-case';
import { UpdateCandidateProfileUseCase } from './application/use-cases/update-candidate-profile.use-case';
import { ProfilesRepository } from './infrasctructure/adapters/profiles.repository';
import { CorePrismaModule } from '@/core/prisma/prisma.module';
import { ProfilesController } from './infrasctructure/profiles.controller';


const useCases = [GetCandidateProfileUseCase, UpdateCandidateProfileUseCase];

const services = [
  {
    provide: IProfilesRepository,
    useClass: ProfilesRepository,
  },
];

@Module({
  imports: [CorePrismaModule],
  controllers: [ProfilesController],
  providers: [...useCases, ...services],
  exports: [IProfilesRepository],
})
export class ProfilesModule {}