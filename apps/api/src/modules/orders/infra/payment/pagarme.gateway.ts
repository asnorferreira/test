import { Injectable, Logger } from "@nestjs/common";
import {
  PaymentGatewayPort,
  PaymentIntentDTO,
  PaymentResult,
} from "../../domain/ports/payment-gateway.port";

@Injectable()
export class PagarmeGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(PagarmeGateway.name);

  async processPayment(intent: PaymentIntentDTO): Promise<PaymentResult> {
    this.logger.log(
      `[PAGAR.ME] Iniciando cobrança de R$ ${intent.amountCents / 100} para o pedido ${intent.orderId}`,
    );

    try {
      // Simulação de chamada HTTP à API do Pagar.me
      // Para simular uma falha e testar o fallback, você pode jogar um erro proposital aqui
      const isSuccess = true; // Altere para false para testar o fallback

      if (!isSuccess) throw new Error("Pagar.me retornou Timeout ou Recusa");

      return {
        success: true,
        transactionId: `pagarme_tx_${Date.now()}`,
        gatewayUsed: "PAGARME",
      };
    } catch (error: any) {
      this.logger.error(`[PAGAR.ME] Erro no processamento: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
