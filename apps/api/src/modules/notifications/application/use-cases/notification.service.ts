import { Injectable, Logger } from "@nestjs/common";
import { NotificationRepository } from "../../domain/repositories/notification.repository";
import { Notification } from "../../domain/entities/notification.entity";
import { MailPort } from "@/core/ports/mail.port";
import { NotificationType } from "@maemais/shared-types";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly mailer: MailPort,
  ) {}

  async sendEmailNotification(
    userId: string | null,
    type: NotificationType,
    email: string,
    subject: string,
    bodyHtml: string,
    payload: any = {},
  ) {
    const notification = Notification.create({
      userId,
      type,
      channel: "EMAIL",
      payload,
    });

    await this.repo.create(notification);

    try {
      await this.mailer.sendEmail({ to: email, subject, bodyHtml });
      notification.markAsSent();
      await this.repo.update(notification);
      this.logger.log(
        `Notificação ${notification.id} enviada via E-mail com sucesso.`,
      );
    } catch (error) {
      notification.markAsError();
      await this.repo.update(notification);
      this.logger.error(
        `Falha ao enviar notificação ${notification.id} via E-mail. Salva como ERROR.`,
        error,
      );
    }
  }
}
