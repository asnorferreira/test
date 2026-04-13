import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "@/config/env.config";
import {
  PaymentGatewayPort,
  PaymentIntentDTO,
  PaymentResult,
} from "../../domain/ports/payment-gateway.port";

/**
 * Integração com a API v5 do Pagar.me (POST /orders).
 * Docs: https://docs.pagar.me/reference/criar-pedido-1
 *
 * Usa fetch nativo (Node 18+). Autenticação via Basic Auth com a secret key.
 */
@Injectable()
export class PagarmeGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(PagarmeGateway.name);

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async processPayment(intent: PaymentIntentDTO): Promise<PaymentResult> {
    const apiKey = this.configService.get("PAGARME_API_KEY", { infer: true });
    const apiUrl = this.configService.get("PAGARME_API_URL", { infer: true });

    if (!apiKey) {
      this.logger.warn(
        "[PAGAR.ME] PAGARME_API_KEY ausente — operando em modo mock.",
      );
      return {
        success: true,
        transactionId: `pagarme_mock_${Date.now()}`,
        gatewayUsed: "PAGARME_MOCK",
      };
    }

    const body = this.buildOrderPayload(intent);
    this.logger.log(
      `[PAGAR.ME] Criando pedido ${intent.orderId} — R$ ${(intent.amountCents / 100).toFixed(2)}`,
    );

    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        },
        body: JSON.stringify(body),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.message ||
          data?.errors?.[0]?.message ||
          `Pagar.me respondeu ${res.status}`;
        this.logger.error(`[PAGAR.ME] Erro ${res.status}: ${message}`);
        return { success: false, error: message, gatewayUsed: "PAGARME" };
      }

      const charge = data?.charges?.[0];
      const transaction = charge?.last_transaction;
      const status: string = charge?.status ?? data?.status;

      const succeeded =
        status === "paid" ||
        status === "waiting_payment" ||
        status === "processing" ||
        status === "authorized";

      if (!succeeded) {
        return {
          success: false,
          error: `Pagamento em status: ${status}`,
          gatewayUsed: "PAGARME",
        };
      }

      return {
        success: true,
        transactionId: transaction?.id ?? charge?.id,
        gatewayOrderId: data?.id,
        gatewayUsed: "PAGARME",
        pix:
          intent.paymentMethod === "PIX"
            ? {
                qrCode: transaction?.qr_code ?? "",
                qrCodeUrl: transaction?.qr_code_url,
                expiresAt: transaction?.expires_at,
              }
            : undefined,
      };
    } catch (error: any) {
      this.logger.error(`[PAGAR.ME] Exceção: ${error.message}`);
      return {
        success: false,
        error: error.message,
        gatewayUsed: "PAGARME",
      };
    }
  }

  private buildOrderPayload(intent: PaymentIntentDTO) {
    const items = (intent.items ?? []).map((i) => ({
      amount: i.unitAmountCents,
      description: i.description,
      quantity: i.quantity,
    }));

    const shipping = intent.shipping
      ? {
          amount: intent.shipping.amountCents,
          description: "Entrega padrão",
          recipient_name: intent.shipping.recipientName,
          recipient_phone: intent.shipping.recipientPhone,
          address: {
            country: intent.shipping.address.country ?? "BR",
            state: intent.shipping.address.state,
            city: intent.shipping.address.city,
            neighborhood: intent.shipping.address.neighborhood,
            street: intent.shipping.address.street,
            street_number: intent.shipping.address.number,
            complementary: intent.shipping.address.complement ?? undefined,
            zip_code: intent.shipping.address.zipCode.replace(/\D/g, ""),
          },
        }
      : undefined;

    const payment =
      intent.paymentMethod === "CREDIT_CARD"
        ? {
            payment_method: "credit_card",
            credit_card: {
              installments: intent.installments ?? 1,
              statement_descriptor: "MAEMAIS",
              card_token: intent.cardToken,
            },
          }
        : {
            payment_method: "pix",
            pix: {
              expires_in: 3600,
            },
          };

    return {
      code: intent.orderId,
      items,
      customer: {
        name: intent.customerName,
        email: intent.customerEmail,
        type: "individual",
        document: intent.customerDocument,
        phones: intent.customerPhone
          ? {
              mobile_phone: this.parsePhone(intent.customerPhone),
            }
          : undefined,
      },
      shipping,
      payments: [payment],
    };
  }

  private parsePhone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    const withoutCountry = digits.startsWith("55") ? digits.slice(2) : digits;
    return {
      country_code: "55",
      area_code: withoutCountry.slice(0, 2),
      number: withoutCountry.slice(2),
    };
  }
}
