import { Inject, Injectable } from '@nestjs/common';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { TalentPoolSubmission } from '@prisma/client';

@Injectable()
export class GetMySubmissionsUseCase {
  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,
  ) {}

  async execute(candidateId: string): Promise<Partial<TalentPoolSubmission>[]> {
    return this.talentPoolRepo.findByCandidateId(candidateId);
  }
}