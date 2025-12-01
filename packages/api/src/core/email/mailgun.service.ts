import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { EmailOptions, IEmailService } from './i-email.service';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class MailgunEmailService implements IEmailService {
  private readonly mailgunKey: string;
  private readonly mailgunDomain: string;
  private readonly fromEmail: string;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.mailgunKey = this.configService.get<string>('MAILGUN_API_KEY') as string;
    this.mailgunDomain = this.configService.get<string>(
      'MAILGUN_DOMAIN',
    ) as string;
    this.fromEmail = this.configService.get<string>(
      'MAILGUN_FROM_EMAIL',
    ) as string;

    if (!this.mailgunKey || !this.mailgunDomain || !this.fromEmail) {
      throw new InternalServerErrorException(
        'Variáveis de ambiente do Mailgun não configuradas.',
      );
    }

    this.apiUrl = `https://api.mailgun.net/v3/${this.mailgunDomain}/messages`;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const form = new FormData(); 
    const to = Array.isArray(options.to) ? options.to.join(',') : options.to;

    form.append('from', this.fromEmail);
    form.append('to', to);
    form.append('subject', options.subject);
    form.append('text', options.text);
    form.append('html', options.html);

    const auth =
      'Basic ' + Buffer.from(`api:${this.mailgunKey}`).toString('base64');

    try {
      await firstValueFrom(
        this.httpService.post(this.apiUrl, form, {
          headers: {
            ...form.getHeaders(),
            Authorization: auth,
          },
        }),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          'Erro ao enviar e-mail via Mailgun:',
          error.response?.data,
        );
      } else {
        console.error('Erro desconhecido ao enviar e-mail:', error);
      }
      throw new InternalServerErrorException('Falha ao enviar e-mail.');
    }
  }
}