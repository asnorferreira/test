import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactRepository } from '../../infrastructure/adapters/contact.repository';
import { CreateContactDto } from '../../presentation/dtos/create-contact.dto';
import { IEmailService } from '@/core/email/i-email.service';
import { ContactMessage } from '@prisma/client';

@Injectable()
export class SendContactMessageUseCase {
  constructor(
    private readonly contactRepo: ContactRepository,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateContactDto) {
    try {
      // 1. Salvar no Banco
      const contact = await this.contactRepo.create(dto);

      // 2. Enviar E-mail para o SAC
      await this.sendSacNotification(contact);

      return {
        success: true,
        message: 'Mensagem recebida com sucesso! Em breve entraremos em contato.',
        protocol: contact.id,
      };
    } catch (error) {
      console.error('Erro ao processar mensagem de contato:', error);
      throw new InternalServerErrorException('Erro ao enviar mensagem. Tente novamente.');
    }
  }

  private async sendSacNotification(contact: ContactMessage) {
    const to = this.configService.get<string>('SAC_EMAIL') || 'contato@jspservicos.com.br';
    const subject = `[Fale Conosco] Nova Mensagem: ${contact.subject || 'Sem Assunto'}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0f172a;">Nova Mensagem do Site</h2>
        <p><strong>Nome:</strong> ${contact.fullName}</p>
        <p><strong>E-mail:</strong> ${contact.email}</p>
        <p><strong>Telefone:</strong> ${contact.phone}</p>
        <p><strong>Assunto:</strong> ${contact.subject || '-'}</p>
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p style="background: #f4f4f5; padding: 15px; border-radius: 5px;">${contact.message.replace(/\n/g, '<br>')}</p>
        <br />
        <a href="mailto:${contact.email}" style="background: #0f172a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Responder</a>
      </div>
    `;

    await this.emailService.sendEmail({
      to,
      subject,
      html,
      text: `Nova mensagem de ${contact.fullName}: ${contact.message}`,
    });
  }
}