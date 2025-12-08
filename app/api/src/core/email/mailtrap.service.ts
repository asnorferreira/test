import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { IEmailService, EmailOptions } from "./i-email.service";

@Injectable()
export class MailtrapService implements IEmailService {
  private transporter;
  private readonly mailFrom: string;

  constructor(private config: ConfigService) {
    this.mailFrom = this.config.get("MAIL_FROM") as string;

    this.transporter = nodemailer.createTransport({
      host: this.config.get("MAIL_HOST"),
      port: this.config.get("MAIL_PORT")!,
      auth: {
        user: this.config.get("MAIL_USER"),
        pass: this.config.get("MAIL_PASS"),
      },
      secure: false,
      tls: {
        ciphers: "SSLv3",
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.mailFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
