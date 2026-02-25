import { Test, TestingModule } from "@nestjs/testing";
import { PrescriptionsController } from "./prescriptions.controller";
import { PrescriptionService } from "../application/use-cases/prescription.service";

describe("PrescriptionsController", () => {
  let controller: PrescriptionsController;
  let service: jest.Mocked<PrescriptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionsController],
      providers: [
        {
          provide: PrescriptionService,
          useValue: {
            getMyPrescriptions: jest.fn().mockResolvedValue([]),
            cancelPrescription: jest
              .fn()
              .mockResolvedValue({ status: "CANCELLED" }),
          },
        },
      ],
    }).compile();

    controller = module.get(PrescriptionsController);
    service = module.get(PrescriptionService);
  });

  it("deve chamar getMyPrescriptions com ID do médico logado", async () => {
    await controller.getMyPrescriptions({ id: "doc-1" });
    expect(service.getMyPrescriptions).toHaveBeenCalledWith("doc-1");
  });

  it("deve chamar cancelPrescription com ID da prescrição e do médico", async () => {
    await controller.cancelPrescription("p-1", { id: "doc-1" });
    expect(service.cancelPrescription).toHaveBeenCalledWith("p-1", "doc-1");
  });
});
