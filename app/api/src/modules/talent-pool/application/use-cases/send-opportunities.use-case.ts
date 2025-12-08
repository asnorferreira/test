import { Inject, Injectable } from "@nestjs/common";
import { ITalentPoolRepository } from "../ports/i-talent-pool.repository";
import { SendOpportunitiesDto } from "../../presentation/dtos/send-opportunities.dto";
import { EmailTemplatesService } from "@/modules/notifications/domain/email-templates.service";
import { IEmailService } from "@/core/email/i-email.service";
import { IIamRepository } from "@/modules/iam/application/ports/i-iam.repository";

@Injectable()
export class SendOpportunitiesUseCase {
  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,

    @Inject(IEmailService)
    private readonly emailService: IEmailService,

    private readonly templatesService: EmailTemplatesService,

    @Inject(IIamRepository)
    private readonly iamRepo: IIamRepository
  ) {}

  async execute(
    dto: SendOpportunitiesDto
  ): Promise<{ success: boolean; count: number }> {
    const submissions =
      await this.talentPoolRepo.findSubmissionsForOpportunities(
        dto.areas,
        dto.candidateIds
      );

    if (submissions.length === 0) {
      return { success: true, count: 0 };
    }

    const emailPromises = submissions.map(async (submission) => {
      const user = await this.iamRepo.findById(
        submission.candidateProfile.userId
      );

      if (!user) return null;

      const { subject, text, html } = this.templatesService.getOpportunityEmail(
        user.fullName,
        dto.areas,
        dto.comment
      );

      return this.emailService.sendEmail({
        to: user.email,
        subject,
        text,
        html,
      });
    });

    await Promise.all(emailPromises);

    return { success: true, count: submissions.length };
  }
}
