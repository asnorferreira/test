import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';

@Injectable()
export class GetSubmissionDetailsUseCase {
  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,
  ) {}

  async execute(id: string) {
    const submission = await this.talentPoolRepo.findDetailsById(id);

    if (!submission) {
      throw new NotFoundException('Submissão não encontrada.');
    }
    return submission;
  }
}