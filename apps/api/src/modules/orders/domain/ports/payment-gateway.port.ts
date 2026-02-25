export interface PaymentIntentDTO {
  orderId: string;
  amountCents: number;
  customerEmail: string;
  customerName: string;
  paymentMethod: "CREDIT_CARD" | "PIX";
  cardToken?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gatewayUsed?: string;
}

export abstract class PaymentGatewayPort {
  abstract processPayment(intent: PaymentIntentDTO): Promise<PaymentResult>;
}
