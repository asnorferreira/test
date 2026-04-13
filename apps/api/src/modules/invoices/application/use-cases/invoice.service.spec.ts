import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { InvoiceRepository } from "../../domain/repositories/invoice.repository";
import { StoragePort } from "@/core/ports/storage.port";

describe("InvoiceService", () => {
  let service: InvoiceService;
  let repo: jest.Mocked<InvoiceRepository>;
  let storage: jest.Mocked<StoragePort>;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: {
            create: jest.fn(),
            createMany: jest.fn(),
            findByOrderId: jest.fn(),
          },
        },
        {
          provide: StoragePort,
          useValue: { uploadPdf: jest.fn(), getFileUrl: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(InvoiceService);
    repo = module.get(InvoiceRepository);
    storage = module.get(StoragePort);
  });

  describe("generateSplitInvoices", () => {
    it("deve gerar 2 NFs calculando o split corretamente e salvar", async () => {
      storage.uploadPdf.mockResolvedValue("path/to/pdf.pdf");

      await service.generateSplitInvoices("ord-1", 15000);

      expect(storage.uploadPdf).toHaveBeenCalledTimes(2);
      expect(repo.createMany).toHaveBeenCalledTimes(1);

      const arrayPassedToCreateMany = repo.createMany.mock.calls[0][0];

      expect(arrayPassedToCreateMany).toHaveLength(2);
      expect(arrayPassedToCreateMany[0].props.amount).toBe(5000);
      expect(arrayPassedToCreateMany[1].props.amount).toBe(10000);
    });

    it("deve lançar BadRequestException se total for inferior a 5000", async () => {
      await expect(
        service.generateSplitInvoices("ord-2", 3000),
      ).rejects.toThrow(BadRequestException);

      expect(storage.uploadPdf).not.toHaveBeenCalled();
    });

    it("deve lançar InternalServerErrorException se o storage falhar", async () => {
      storage.uploadPdf.mockRejectedValue(new Error("Supabase Storage Down"));

      await expect(
        service.generateSplitInvoices("ord-3", 15000),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("getInvoicesByOrder", () => {
    it("deve mapear os registros do banco resolvendo a Signed URL", async () => {
      const mockInvoice = {
        id: "1",
        props: {
          type: "FARMACIA_PRODUTO",
          amount: 5000,
          documentUrl: "path.pdf",
          issuedAt: new Date(),
        },
      } as any;

      repo.findByOrderId.mockResolvedValue([mockInvoice]);
      storage.getFileUrl.mockResolvedValue("https://supabase.co/signed-url");

      const result = await service.getInvoicesByOrder("ord-1");

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe("https://supabase.co/signed-url");
    });
  });
});
