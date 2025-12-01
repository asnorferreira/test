import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { UpdateStatusDto } from '../../presentation/dtos/update-status.dto';
import { SubmissionStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TalentPoolEvents } from '../../domain/talent-pool-events.constants';
import { IIamRepository } from '@/modules/iam/application/ports/i-iam.repository';

@Injectable()
export class UpdateSubmissionStatusUseCase {
  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,
    @Inject(IIamRepository)
    private readonly iamRepo: IIamRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateStatusDto): Promise<{ message: string }> {
    const submission = await this.talentPoolRepo.updateStatus(id, dto.status);

    this.eventEmitter.emit(TalentPoolEvents.STATUS_UPDATED, {
      candidateEmail: submission.email,
      newStatus: submission.status,
    });

    if (dto.status === SubmissionStatus.CONTRATADO) {
      this.eventEmitter.emit(TalentPoolEvents.CANDIDATE_HIRED, {
        candidateName: submission.nomeCompleto,
      });
    }

    return { message: 'Status atualizado com sucesso.' };
  }
}