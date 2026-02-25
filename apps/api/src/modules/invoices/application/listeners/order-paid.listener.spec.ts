import { Test, TestingModule } from "@nestjs/testing";
import { OrderPaidListener } from "./order-paid.listener";
import { InvoiceService } from "../use-cases/invoice.service";

describe("OrderPaidListener", () => {
  let listener: OrderPaidListener;
  let service: jest.Mocked<InvoiceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderPaidListener,
        {
          provide: InvoiceService,
          useValue: { generateSplitInvoices: jest.fn() },
        },
      ],
    }).compile();

    listener = module.get(OrderPaidListener);
    service = module.get(InvoiceService);
  });

  it("deve chamar invoiceService ao receber o evento de ordem paga", async () => {
    await listener.handleOrderPaidEvent({
      orderId: "ord-123",
      totalAmountCents: 20000,
    });
    expect(service.generateSplitInvoices).toHaveBeenCalledWith(
      "ord-123",
      20000,
    );
  });
});
