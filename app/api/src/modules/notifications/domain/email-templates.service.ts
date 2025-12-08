import { Injectable } from "@nestjs/common";
import { SubmissionStatus } from "@prisma/client";

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class EmailTemplatesService {
  private getBaseHtml(body: string): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Portal de Carreiras JSP</h2>
        <p>${body}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #777;">
          Esta é uma mensagem automática. Por favor, não responda.
        </p>
      </div>
    `;
  }

  // Evento: AuthEvents.USER_REGISTERED
  getWelcomeEmail(fullName: string): EmailContent {
    const subject = "Cadastro realizado com sucesso!";
    const text = `Olá, ${fullName}.\n\nSeu cadastro no Portal de Carreiras JSP foi realizado.\nAtive sua conta ou aguarde as próximas etapas.`;
    const html = this.getBaseHtml(
      `Olá, <strong>${fullName}</strong>.<br/><br/>Seu cadastro no Portal de Carreiras JSP foi realizado.<br/>Em breve, você poderá usar seu login para acompanhar o status de suas candidaturas.`
    );
    return { subject, text, html };
  }

  // Evento: AuthEvents.STAFF_USER_CREATED
  getStaffWelcomeEmail(fullName: string, tempPassword: string): EmailContent {
    const subject = "Sua conta de acesso (RH/Gestor) JSP foi criada!";
    const text = `Olá, ${fullName}.\n\nUma conta de acesso ao Portal de Carreiras JSP foi criada para você.\nSua senha temporária é: ${tempPassword}\nRecomendamos alterá-la no primeiro login.`;
    const html = this.getBaseHtml(
      `Olá, <strong>${fullName}</strong>.<br/><br/>Uma conta de acesso (RH/Gestor) ao Portal de Carreiras JSP foi criada para você.<br/>
       Sua senha temporária é: <strong>${tempPassword}</strong><br/><br/>
       Recomendamos fortemente que você altere esta senha no seu primeiro login.`
    );
    return { subject, text, html };
  }

  // Evento: TalentPoolEvents.SUBMISSION_CREATED (Para Candidato)
  getSubmissionReceivedEmail(fullName: string): EmailContent {
    const subject = "Recebemos seu currículo!";
    const text = `Olá, ${fullName}.\n\nRecebemos seu currículo para nosso banco de talentos! Nossa equipe de RH irá analisá-lo e entrará em contato assim que houver uma oportunidade alinhada ao seu perfil.`;
    const html = this.getBaseHtml(
      `Olá, <strong>${fullName}</strong>.<br/><br/>Recebemos seu currículo para nosso banco de talentos! Nossa equipe de RH irá analisá-lo e entrará em contato assim que houver uma oportunidade alinhada ao seu perfil.<br/><br/>Boa sorte!`
    );
    return { subject, text, html };
  }

  // Evento: TalentPoolEvents.SUBMISSION_CREATED (Para RH)
  getNewSubmissionAlertEmail(candidateName: string): EmailContent {
    const subject = `Nova candidatura recebida: ${candidateName}`;
    const text = `Um novo candidato (${candidateName}) se inscreveu no banco de talentos.\n\nAcesse o painel de RH para analisar.`;
    const html = this.getBaseHtml(
      `Um novo candidato (<strong>${candidateName}</strong>) acabou de se inscrever no banco de talentos.<br/><br/>Acesse o painel de RH para iniciar a análise.`
    );
    return { subject, text, html };
  }

  // Evento: TalentPoolEvents.STATUS_UPDATED (Para Candidato)
  getStatusUpdateEmail(
    fullName: string,
    newStatus: SubmissionStatus
  ): EmailContent {
    let subject = "Atualização sobre sua candidatura na JSP";
    let body = `Olá, ${fullName}.<br/><br/>Houve uma atualização no status da sua candidatura: <strong>${newStatus}</strong>.`;

    switch (newStatus) {
      case SubmissionStatus.EM_ANALISE:
        subject = "Boas notícias! Seu perfil está em análise";
        body = `Olá, <strong>${fullName}</strong>.<br/><br/>Boas notícias! Seu perfil foi selecionado e agora está <strong>EM ANÁLISE</strong> pela nossa equipe de RH. Entraremos em contato em breve.`;
        break;
      case SubmissionStatus.ENTREVISTA:
        subject = "Parabéns! Você avançou para a etapa de entrevista";
        body = `Olá, <strong>${fullName}</strong>.<br/><br/>Parabéns! Você avançou no processo seletivo e seu status agora é <strong>ENTREVISTA</strong>. Aguarde nosso contato com os detalhes de agendamento.`;
        break;
      case SubmissionStatus.CONTRATADO:
        subject = "Seja bem-vindo(a) à JSP!";
        body = `Olá, <strong>${fullName}</strong>.<br/><br/>Seja bem-vindo(a) à equipe JSP! Você foi <strong>CONTRATADO(A)</strong>. Nosso departamento pessoal entrará em contato para os próximos passos da sua admissão.`;
        break;
      case SubmissionStatus.REPROVADO:
        subject = "Agradecemos seu interesse no processo seletivo JSP";
        body = `Olá, <strong>${fullName}</strong>.<br/><br/>Agradecemos seu interesse e participação em nosso processo seletivo. No momento, seu perfil foi <strong>REPROVADO</strong> para esta oportunidade, mas manteremos seu currículo em nosso banco de talentos para futuras posições.`;
        break;
    }

    const text = body
      .replace(/<br\/?>/g, "\n")
      .replace(/<strong>|<\/strong>/g, "");
    const html = this.getBaseHtml(body);
    return { subject, text, html };
  }

  // Evento: TalentPoolEvents.CANDIDATE_HIRED (Para Gestor)
  getHiredAlertEmail(candidateName: string): EmailContent {
    const subject = `Candidato Contratado: ${candidateName}`;
    const text = `O candidato ${candidateName} foi movido para o status 'Contratado' pela equipe de RH.\n\nAcesse o painel para visibilidade gerencial.`;
    const html = this.getBaseHtml(
      `O candidato <strong>${candidateName}</strong> foi movido para o status 'Contratado' pela equipe de RH.<br/><br/>Acesse o painel para visibilidade gerencial.`
    );
    return { subject, text, html };
  }

  getOpportunityEmail(
    fullName: string,
    areas: string[],
    comment?: string
  ): EmailContent {
    const subject = `Novas Oportunidades de Vaga na JSP em ${areas[0]}`;

    const areasList = areas.map((a) => `<li>${a}</li>`).join("");

    const commentBlock = comment
      ? `<p style="margin-top: 20px; background-color: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 3px solid #0f172a;">
        <strong>Comentário da Equipe RH:</strong><br/> ${comment}
      </p>`
      : "";

    const body = `
      Olá, <strong>${fullName}</strong>.<br/><br/>
      Nossa equipe de RH encontrou oportunidades que se alinham ao seu perfil nas seguintes áreas:
      <ul style="margin-top: 10px; list-style-type: disc; padding-left: 20px;">
        ${areasList}
      </ul>
      ${commentBlock}
      <p style="margin-top: 20px;">Ficou interessado? Acesse nosso portal para mais detalhes e atualize seu currículo, se necessário!</p>
    `;

    const text = body
      .replace(/<br\/?>/g, "\n")
      .replace(/<strong>|<\/strong>/g, "")
      .replace(/<[^>]*>/g, "");
    const html = this.getBaseHtml(body);

    return { subject, text, html };
  }
}
