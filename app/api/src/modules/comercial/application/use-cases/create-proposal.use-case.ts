import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommercialRepository } from '../../infrastructure/adapters/commercial.repository';
import { CreateProposalDto } from '../../presentation/dtos/create-proposal.dto';
import { IEmailService } from '@/core/email/i-email.service'; // Ajuste o import conforme sua estrutura
import { CommercialLead } from '@prisma/client';

@Injectable()
export class CreateProposalUseCase {
  constructor(
    private readonly commercialRepo: CommercialRepository,
    
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateProposalDto) {
    try {
      const lead = await this.commercialRepo.create(dto);
      
      await this.sendNotificationEmail(lead, dto);
      
      return {
        success: true,
        message: 'Sua proposta foi recebida. Nossa equipe entrará em contato em breve.',
        protocol: lead.id,
      };
    } catch (error) {
      console.error('Erro ao processar lead comercial:', error);
      throw new InternalServerErrorException('Não foi possível processar sua solicitação no momento.');
    }
  }

  private async sendNotificationEmail(lead: CommercialLead, dto: CreateProposalDto) {
    const to = this.configService.get<string>('COMMERCIAL_TEAM_EMAIL') || 'admin@jsp.com';
    const subject = `🚀 Nova Oportunidade Comercial: ${dto.company}`;
    const htmlContent = this.generateEmailTemplate(lead, dto);
    
    await this.emailService.sendEmail({
      to,
      subject,
      html: htmlContent, 
      text: `Nova proposta recebida de ${dto.company}. Solicitação: ${dto.needsDescription || 'Sem descrição'}. Acesse o sistema para ver mais.`,
    });
  }

  /**
   * Gera um template HTML corporativo e responsivo.
   */
  private generateEmailTemplate(lead: CommercialLead, dto: CreateProposalDto): string {
    const servicesList = dto.services.map(s => `<span style="background-color: #eef2ff; color: #4f46e5; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">${s}</span>`).join('');
    
    const description = dto.needsDescription 
      ? dto.needsDescription.replace(/\n/g, '<br>') 
      : '<em style="color: #999;">Nenhuma descrição adicional fornecida.</em>';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background-color: #0f172a; padding: 30px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px; color: #334155; }
        .info-group { margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
        .info-group:last-child { border-bottom: none; }
        .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; display: block; }
        .value { font-size: 16px; color: #0f172a; line-height: 1.5; font-weight: 500; }
        .highlight { color: #2563eb; text-decoration: none; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .badge-container { margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nova Proposta Recebida</h1>
        </div>

        <div class="content">
          <p style="margin-bottom: 25px;">Olá Equipe,</p>
          <p style="margin-bottom: 30px;">Um novo lead B2B acabou de preencher o formulário de proposta de terceirização no site. Confira os detalhes abaixo:</p>

          <div class="info-group">
            <span class="label">Empresa & Setor</span>
            <div class="value">${dto.company} <span style="color: #cbd5e1;">|</span> ${dto.sector}</div>
          </div>

          <div class="info-group">
            <span class="label">Solicitante</span>
            <div class="value">
              ${dto.fullName} <br>
              <span style="font-size: 14px; color: #64748b;">${dto.position}</span>
            </div>
          </div>

          <div class="info-group">
            <span class="label">Contatos</span>
            <div class="value">
              📧 <a href="mailto:${dto.email}" class="highlight">${dto.email}</a><br>
              📱 <a href="tel:${dto.phone.replace(/[^0-9]/g, '')}" class="highlight">${dto.phone}</a>
            </div>
          </div>

          <div class="info-group">
            <span class="label">Escopo do Projeto</span>
            <div class="value" style="margin-bottom: 8px;">Headcount Estimado: <strong>${dto.estimatedHeadcount} colaboradores</strong></div>
            <div class="badge-container">${servicesList}</div>
          </div>

          <div class="info-group">
            <span class="label">Detalhes da Necessidade</span>
            <div class="value" style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #cbd5e1; margin-top: 8px;">
              ${description}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${dto.email}?subject=Retorno sobre Proposta JSP&body=Olá ${dto.fullName}, recebemos sua solicitação..." 
               style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
               Responder Solicitante
            </a>
          </div>
        </div>

        <div class="footer">
          <p>Lead gerado automaticamente pelo Portal JSP.<br>Protocolo: #${lead.id}</p>
          <p>© ${new Date().getFullYear()} JSP Serviços. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}