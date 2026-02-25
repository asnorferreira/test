import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserRegisteredEvent } from "../../domain/events/user-registered.event";
import { MailPort } from "@/core/ports/mail.port";
import { CONSTANTS } from "@maemais/shared-types";

@Injectable()
export class AuthEventsListener {
  private readonly logger = new Logger(AuthEventsListener.name);

  constructor(private readonly mailPort: MailPort) {}

  @OnEvent(CONSTANTS.EVENTS.USER_REGISTERED, { async: true })
  async handleUserRegisteredEvent(event: UserRegisteredEvent) {
    this.logger.log(
      `Processando envio de e-mail de boas-vindas para: ${event.email}`,
    );

    try {
      await this.mailPort.sendEmail({
        to: event.email,
        subject: "Bem-vinda à MãeMais! 💖",
        bodyHtml: `
          <h1>Olá, ${event.name}!</h1>
          <p>Seja muito bem-vinda à plataforma MãeMais.</p>
          <p>Estamos aqui para apoiar sua jornada de amamentação com carinho e ciência.</p>
          <br/>
          <p>Equipe MãeMais</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        `Falha ao enviar e-mail de boas-vindas para ${event.email}`,
        error,
      );
    }
  }
}
