import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { InvoiceRepository } from "../../domain/repositories/invoice.repository";
import { StoragePort } from "@/core/ports/storage.port";

describe("InvoiceService", () => {
  let service: InvoiceService;
  let repo: jest.Mocked<InvoiceRepository>;
  let storage: jest.Mocked<StoragePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: { create: jest.fn(), findByOrderId: jest.fn() },
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
    it("deve gerar 2 NFs calculando o split corretamente", async () => {
      storage.uploadPdf.mockResolvedValue("path/to/pdf.pdf");

      await service.generateSplitInvoices("ord-1", 15000);

      expect(storage.uploadPdf).toHaveBeenCalledTimes(2);

      expect(repo.create).toHaveBeenCalledTimes(2);

      const call1 = repo.create.mock.calls[0][0];
      const call2 = repo.create.mock.calls[1][0];

      expect(call1.props.amount).toBe(5000);
      expect(call2.props.amount).toBe(10000);
    });

    it("deve lançar BadRequestException se total < 5000", async () => {
      await expect(
        service.generateSplitInvoices("ord-2", 3000),
      ).rejects.toThrow(BadRequestException);

      expect(storage.uploadPdf).not.toHaveBeenCalled();
    });

    it("deve lançar InternalServerErrorException se o storage falhar", async () => {
      storage.uploadPdf.mockRejectedValue(new Error("S3 down"));

      await expect(
        service.generateSplitInvoices("ord-3", 15000),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("getInvoicesByOrder", () => {
    it("deve mapear os registros do banco resolvendo a URL pública", async () => {
      const mockInvoice = {
        id: "1",
        props: {
          type: "FARMACIA",
          amount: 5000,
          documentUrl: "path.pdf",
          issuedAt: new Date(),
        },
      } as any;
      repo.findByOrderId.mockResolvedValue([mockInvoice]);
      storage.getFileUrl.mockResolvedValue("http://public-url.com");

      const result = await service.getInvoicesByOrder("ord-1");

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe("http://public-url.com");
    });
  });
});
