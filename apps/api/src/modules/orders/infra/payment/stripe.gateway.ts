import { Injectable, Logger } from "@nestjs/common";
import {
  PaymentGatewayPort,
  PaymentIntentDTO,
  PaymentResult,
} from "../../domain/ports/payment-gateway.port";

@Injectable()
export class StripeGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(StripeGateway.name);

  async processPayment(intent: PaymentIntentDTO): Promise<PaymentResult> {
    this.logger.log(
      `[STRIPE] Iniciando cobrança de R$ ${intent.amountCents / 100} para o pedido ${intent.orderId}`,
    );

    try {
      return {
        success: true,
        transactionId: `pi_stripe_${Date.now()}`,
        gatewayUsed: "STRIPE",
      };
    } catch (error: any) {
      this.logger.error(`[STRIPE] Erro no processamento: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
