import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProfilesRepository } from '../ports/i-profiles.repository';
import { CandidateProfile } from '@prisma/client';

@Injectable()
export class GetCandidateProfileUseCase {
  constructor(
    @Inject(IProfilesRepository)
    private readonly profilesRepository: IProfilesRepository,
  ) {}

  async execute(userId: string): Promise<CandidateProfile> {
    const profile = await this.profilesRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException(
        'Perfil de candidato não encontrado. Preencha seus dados no Passo 2.',
      );
    }

    return profile;
  }
}