export interface PaymentIntentItem {
  description: string;
  quantity: number;
  unitAmountCents: number;
}

export interface PaymentIntentShipping {
  amountCents: number;
  recipientName: string;
  recipientPhone: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    country?: string;
  };
}

export interface PaymentIntentDTO {
  orderId: string;
  amountCents: number;
  customerEmail: string;
  customerName: string;
  customerDocument?: string;
  customerPhone?: string;
  paymentMethod: "CREDIT_CARD" | "PIX";
  cardToken?: string;
  installments?: number;
  items?: PaymentIntentItem[];
  shipping?: PaymentIntentShipping;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  gatewayOrderId?: string;
  error?: string;
  gatewayUsed?: string;
  pix?: {
    qrCode: string;
    qrCodeUrl?: string;
    expiresAt?: string;
  };
}

export abstract class PaymentGatewayPort {
  abstract processPayment(intent: PaymentIntentDTO): Promise<PaymentResult>;
}
