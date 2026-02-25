import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PaymentGatewayPort,
  PaymentIntentDTO,
  PaymentResult,
} from "../../domain/ports/payment-gateway.port";
import { PagarmeGateway } from "./pagarme.gateway";
import { StripeGateway } from "./stripe.gateway";
import { Env } from "@/config/env.config";

@Injectable()
export class PaymentManager implements PaymentGatewayPort {
  private readonly logger = new Logger(PaymentManager.name);
  private primaryGateway: PaymentGatewayPort;
  private secondaryGateway: PaymentGatewayPort;

  constructor(
    private readonly pagarme: PagarmeGateway,
    private readonly stripe: StripeGateway,
    private readonly configService: ConfigService<Env, true>,
  ) {
    const defaultGateway = this.configService.get("DEFAULT_PAYMENT_GATEWAY", {
      infer: true,
    });

    if (defaultGateway === "STRIPE") {
      this.primaryGateway = this.stripe;
      this.secondaryGateway = this.pagarme;
    } else {
      this.primaryGateway = this.pagarme;
      this.secondaryGateway = this.stripe;
    }
  }

  async processPayment(intent: PaymentIntentDTO): Promise<PaymentResult> {
    this.logger.log(
      `Tentando gateway primário: ${this.primaryGateway.constructor.name}`,
    );

    const primaryResult = await this.primaryGateway.processPayment(intent);

    if (primaryResult.success) {
      return primaryResult;
    }

    this.logger.warn(
      `Gateway primário falhou! Acionando Fallback: ${this.secondaryGateway.constructor.name}`,
    );

    const secondaryResult = await this.secondaryGateway.processPayment(intent);

    if (secondaryResult.success) {
      this.logger.log(
        `✅ Pagamento recuperado com sucesso pelo gateway de Fallback!`,
      );
      return secondaryResult;
    }

    this.logger.error(
      `Ambos os gateways falharam para o pedido ${intent.orderId}.`,
    );
    return {
      success: false,
      error:
        "Não foi possível processar o pagamento em nenhum dos provedores disponíveis.",
    };
  }
}
