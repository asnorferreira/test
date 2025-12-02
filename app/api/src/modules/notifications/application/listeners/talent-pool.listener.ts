import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IEmailService } from '@/core/email/i-email.service';
import { EmailTemplatesService } from '../../domain/email-templates.service';
import { TalentPoolEvents } from '@/modules/talent-pool/domain/talent-pool-events.constants';
import { IIamRepository } from '@/modules/iam/application/ports/i-iam.repository';
import { UserRole } from '@jsp/shared';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class TalentPoolListener {
  constructor(
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    private readonly templates: EmailTemplatesService,
    @Inject(IIamRepository)
    private readonly iamRepo: IIamRepository,
  ) {}

  /**
   * Ouve o evento de nova submissão.
   * Notifica o Candidato E todos os usuários RH.
   */
  @OnEvent(TalentPoolEvents.SUBMISSION_CREATED)
  async handleSubmissionCreated(payload: {
    candidateEmail: string;
    candidateName: string;
  }) {
    const candidateEmailContent = this.templates.getSubmissionReceivedEmail(
      payload.candidateName,
    );
    await this.emailService.sendEmail({
      to: payload.candidateEmail,
      ...candidateEmailContent,
    });

    const rhUsers = await this.iamRepo.findUsersByRole([UserRole.RH]);
    if (rhUsers.length > 0) {
      const rhEmails = rhUsers.map((user) => user.email);
      const rhEmailContent = this.templates.getNewSubmissionAlertEmail(
        payload.candidateName,
      );

      await this.emailService.sendEmail({
        to: rhEmails,
        ...rhEmailContent,
      });
    }
  }

  /**
   * Ouve o evento de atualização de status.
   * Notifica o Candidato.
   */
  @OnEvent(TalentPoolEvents.STATUS_UPDATED)
  async handleStatusUpdated(payload: {
    candidateEmail: string;
    newStatus: SubmissionStatus;
  }) {
    const user = await this.iamRepo.findUserByEmail(payload.candidateEmail);
    if (!user) return; 

    const emailContent = this.templates.getStatusUpdateEmail(
      user.fullName,
      payload.newStatus,
    );

    if (payload.newStatus === SubmissionStatus.NOVO) {
      return;
    }

    await this.emailService.sendEmail({
      to: payload.candidateEmail,
      ...emailContent,
    });
  }

  /**
   * Ouve o evento de contratação.
   * Notifica todos os Gestores.
   */
  @OnEvent(TalentPoolEvents.CANDIDATE_HIRED)
  async handleCandidateHired(payload: { candidateName: string }) {
    const gestorUsers = await this.iamRepo.findUsersByRole([UserRole.GESTOR]);

    if (gestorUsers.length > 0) {
      const gestorEmails = gestorUsers.map((user) => user.email);
      const emailContent = this.templates.getHiredAlertEmail(
        payload.candidateName,
      );

      await this.emailService.sendEmail({
        to: gestorEmails,
        ...emailContent,
      });
    }
  }
}