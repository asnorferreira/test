import { Inject, Injectable } from '@nestjs/common';
import {
  IProfilesRepository,
  UpsertProfileData,
} from '../ports/i-profiles.repository';
import { CandidateProfile } from '@prisma/client';
import { UpdateProfileDto } from '../../presentation/dtos/update-profile.dto';

@Injectable()
export class UpdateCandidateProfileUseCase {
  constructor(
    @Inject(IProfilesRepository)
    private readonly profilesRepository: IProfilesRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<CandidateProfile> {
    const dataToUpsert: UpsertProfileData = {
      nomeCompleto: dto.nomeCompleto,
      telefone: dto.telefone,
      cidade: dto.cidade,
      linkedinUrl: dto.linkedinUrl,
    };

    const updatedProfile = await this.profilesRepository.upsert(
      userId,
      dataToUpsert,
    );

    return updatedProfile;
  }
}