import { Injectable, Logger } from "@nestjs/common";
import { MailPort, SendMailDTO } from "@/core/ports/mail.port";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/config/env.config";

@Injectable()
export class MailtrapAdapter implements MailPort {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailtrapAdapter.name);
  private readonly defaultFrom: string;

  constructor(private configService: ConfigService<Env, true>) {
    this.defaultFrom = this.configService.get("MAIL_FROM", { infer: true });

    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAIL_HOST", { infer: true }),
      port: this.configService.get("MAIL_PORT", { infer: true }),
      auth: {
        user: this.configService.get("MAIL_USER", { infer: true }),
        pass: this.configService.get("MAIL_PASS", { infer: true }),
      },
    });
  }

  async sendEmail(data: SendMailDTO): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"MãeMais" <${this.defaultFrom}>`,
        to: data.to,
        subject: data.subject,
        html: data.bodyHtml,
        attachments: data.attachments,
      });
      this.logger.log(
        `📧 E-mail enviado com sucesso para ${data.to} - Assunto: "${data.subject}"`,
      );
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${data.to}`, error);
      throw new Error("Falha no serviço de envio de e-mail.");
    }
  }
}
