import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationService } from "../use-cases/notification.service";
import { UserRepository } from "@/modules/users/domain/repositories/user.repository";
import {
  CONSTANTS,
  NotificationType,
  MedicalReviewStatus,
} from "@maemais/shared-types";

@Injectable()
export class GlobalEventsListener {
  private readonly logger = new Logger(GlobalEventsListener.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly userRepository: UserRepository,
  ) {}

  @OnEvent(CONSTANTS.EVENTS.MEDICAL_CASE_REVIEWED, { async: true })
  async handleMedicalCaseReviewed(event: any) {
    const user = await this.userRepository.findById(event.userId);
    if (!user) return;

    let subject = "";
    let body = "";

    if (event.status === MedicalReviewStatus.APPROVED_BY_MEDICAL) {
      subject = "Aprovado! Siga para a compra da Fórmula MãeMais";
      body = `Olá ${user.props.name},<br/><br/>Seu caso foi revisado e aprovado pela nossa equipe clínica! Acesse a plataforma para concluir a compra da sua fórmula.`;
    } else if (event.status === MedicalReviewStatus.REJECTED_BY_MEDICAL) {
      subject = "Atualização sobre seu caso MãeMais";
      body = `Olá ${user.props.name},<br/><br/>Nossa equipe clínica revisou seu questionário e não pudemos aprovar a formulação no momento devido a restrições médicas ou alertas na sua anamnese.<br/><br/>Entre em contato com o suporte para maiores informações.`;
    } else {
      return;
    }

    await this.notificationService.sendEmailNotification(
      user.id,
      NotificationType.PRESCRIPTION_READY,
      user.props.email,
      subject,
      body,
      { caseId: event.caseId, status: event.status },
    );
  }

  @OnEvent(CONSTANTS.EVENTS.ORDER_PAID, { async: true })
  async handleOrderPaid(event: any) {
    const user = await this.userRepository.findById(event.userId);
    if (!user) return;

    const subject = "Pagamento Confirmado! Seu pedido já está em separação";
    const body = `Olá ${user.props.name},<br/><br/>O pagamento do seu pedido #${event.orderId} foi confirmado.<br/>Sua Fórmula MãeMais Venda Direta está sendo preparada com carinho e logo será enviada.`;

    await this.notificationService.sendEmailNotification(
      user.id,
      NotificationType.GENERIC,
      user.props.email,
      subject,
      body,
      { orderId: event.orderId, amount: event.totalAmountCents },
    );
  }

  @OnEvent(CONSTANTS.EVENTS.PAYMENT_FAILED, { async: true })
  async handlePaymentFailed(event: any) {
    const user = await this.userRepository.findById(event.userId);
    if (!user) return;

    const subject = "Problema no pagamento do seu pedido MãeMais";
    const body = `Olá ${user.props.name},<br/><br/>Infelizmente houve um problema no processamento do pagamento do seu pedido #${event.orderId}.<br/>Por favor, acesse a plataforma e tente novamente com outro cartão ou via PIX.`;

    await this.notificationService.sendEmailNotification(
      user.id,
      NotificationType.PAYMENT_FAILED,
      user.props.email,
      subject,
      body,
      { orderId: event.orderId },
    );
  }
}
