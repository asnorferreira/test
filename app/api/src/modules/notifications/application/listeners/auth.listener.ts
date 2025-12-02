import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthEvents } from '@/modules/iam/domain/constants/auth-events.constants';
import { IEmailService } from '@/core/email/i-email.service';
import { EmailTemplatesService } from '../../domain/email-templates.service';

@Injectable()
export class AuthListener {
  constructor(
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    private readonly templates: EmailTemplatesService,
  ) {}

  /**
   * Ouve o evento de registro de candidato
   */
  @OnEvent(AuthEvents.USER_REGISTERED)
  async handleUserRegistered(payload: { email: string; fullName: string }) {
    const { email, fullName } = payload;
    const { subject, text, html } = this.templates.getWelcomeEmail(fullName);

    await this.emailService.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Ouve o evento de criação de usuário staff (RH/Gestor)
   */
  @OnEvent(AuthEvents.STAFF_USER_CREATED)
  async handleStaffCreated(payload: {
    email: string;
    fullName: string;
    tempPassword: string;
  }) {
    const { email, fullName, tempPassword } = payload;
    const { subject, text, html } = this.templates.getStaffWelcomeEmail(
      fullName,
      tempPassword,
    );

    await this.emailService.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}