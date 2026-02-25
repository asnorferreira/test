import { Test, TestingModule } from "@nestjs/testing";
import { InvoicesController } from "./invoices.controller";
import { InvoiceService } from "../application/use-cases/invoice.service";

describe("InvoicesController", () => {
  let controller: InvoicesController;
  let service: jest.Mocked<InvoiceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoiceService,
          useValue: { getInvoicesByOrder: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    controller = module.get(InvoicesController);
    service = module.get(InvoiceService);
  });

  it("deve chamar o service para obter faturas", async () => {
    await controller.getInvoices("ord-1");
    expect(service.getInvoicesByOrder).toHaveBeenCalledWith("ord-1");
  });
});
