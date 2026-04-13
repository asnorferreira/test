import { ConfigService } from "@nestjs/config";
import { PagarmeGateway } from "./pagarme.gateway";
import { PaymentIntentDTO } from "../../domain/ports/payment-gateway.port";

describe("PagarmeGateway", () => {
  const baseIntent: PaymentIntentDTO = {
    orderId: "order-1",
    amountCents: 15000,
    customerEmail: "maria@test.com",
    customerName: "Maria Silva",
    customerDocument: "12345678900",
    customerPhone: "11999999999",
    paymentMethod: "CREDIT_CARD",
    cardToken: "tok_abc",
    installments: 1,
    items: [
      { description: "Produto 1", quantity: 1, unitAmountCents: 13010 },
    ],
    shipping: {
      amountCents: 1990,
      recipientName: "Maria",
      recipientPhone: "11999999999",
      address: {
        zipCode: "01310100",
        street: "Av Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      },
    },
  };

  function buildConfig(env: Record<string, string>) {
    return {
      get: (key: string) => env[key],
    } as unknown as ConfigService<any, true>;
  }

  it("cai em modo mock quando PAGARME_API_KEY está ausente", async () => {
    const gateway = new PagarmeGateway(
      buildConfig({ PAGARME_API_URL: "https://api.pagar.me/core/v5" }),
    );
    const result = await gateway.processPayment(baseIntent);
    expect(result.success).toBe(true);
    expect(result.gatewayUsed).toBe("PAGARME_MOCK");
  });

  it("chama API Pagar.me e retorna sucesso quando charge está paid", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "or_abc",
          charges: [
            {
              id: "ch_1",
              status: "paid",
              last_transaction: { id: "tran_1" },
            },
          ],
        }),
      } as any);

    const gateway = new PagarmeGateway(
      buildConfig({
        PAGARME_API_KEY: "sk_test_123",
        PAGARME_API_URL: "https://api.pagar.me/core/v5",
      }),
    );
    const result = await gateway.processPayment(baseIntent);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.pagar.me/core/v5/orders",
      expect.objectContaining({ method: "POST" }),
    );
    const callBody = JSON.parse((fetchSpy.mock.calls[0][1] as any).body);
    expect(callBody.code).toBe("order-1");
    expect(callBody.shipping.amount).toBe(1990);
    expect(callBody.shipping.address.zip_code).toBe("01310100");
    expect(callBody.payments[0].payment_method).toBe("credit_card");
    expect(result.success).toBe(true);
    expect(result.transactionId).toBe("tran_1");
    expect(result.gatewayOrderId).toBe("or_abc");

    fetchSpy.mockRestore();
  });

  it("retorna erro quando Pagar.me responde status != 2xx", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Cartão inválido" }),
    } as any);

    const gateway = new PagarmeGateway(
      buildConfig({
        PAGARME_API_KEY: "sk_test_123",
        PAGARME_API_URL: "https://api.pagar.me/core/v5",
      }),
    );
    const result = await gateway.processPayment(baseIntent);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Cartão inválido");

    fetchSpy.mockRestore();
  });

  it("monta payload de PIX corretamente", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "or_pix",
        charges: [
          {
            id: "ch_pix",
            status: "waiting_payment",
            last_transaction: {
              id: "tran_pix",
              qr_code: "00020126...",
              qr_code_url: "https://qr.test",
              expires_at: "2099-01-01T00:00:00Z",
            },
          },
        ],
      }),
    } as any);

    const gateway = new PagarmeGateway(
      buildConfig({
        PAGARME_API_KEY: "sk_test_123",
        PAGARME_API_URL: "https://api.pagar.me/core/v5",
      }),
    );
    const result = await gateway.processPayment({
      ...baseIntent,
      paymentMethod: "PIX",
      cardToken: undefined,
    });

    const callBody = JSON.parse((fetchSpy.mock.calls[0][1] as any).body);
    expect(callBody.payments[0].payment_method).toBe("pix");
    expect(result.success).toBe(true);
    expect(result.pix?.qrCode).toBe("00020126...");

    fetchSpy.mockRestore();
  });
});
