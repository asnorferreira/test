import { Inject, Injectable } from '@nestjs/common';
import {
  ITalentPoolRepository,
  PaginationResponse,
} from '../ports/i-talent-pool.repository';
import { TalentPoolSubmission } from '@prisma/client';
import { GetTalentPoolQueryDto } from '../../presentation/dtos/get-talent-pool-query.dto';

@Injectable()
export class GetTalentPoolUseCase {
  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,
  ) {}

  /**
   * Executa a busca paginada e filtrada do banco de talentos.
   */
  async execute(
    query: GetTalentPoolQueryDto,
  ): Promise<PaginationResponse<TalentPoolSubmission>> {
    query.page = Number(query.page) || 1;
    query.limit = Number(query.limit) || 10;

    return this.talentPoolRepo.findAllPaginated(query);
  }
}