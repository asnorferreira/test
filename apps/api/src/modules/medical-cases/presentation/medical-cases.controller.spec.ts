import { Test, TestingModule } from "@nestjs/testing";
import { MedicalCasesController } from "./medical-cases.controller";
import { MedicalCaseService } from "../application/use-cases/medical-case.service";
import { MedicalReviewStatus } from "@maemais/shared-types";

describe("MedicalCasesController", () => {
  let controller: MedicalCasesController;
  let service: jest.Mocked<MedicalCaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalCasesController],
      providers: [
        {
          provide: MedicalCaseService,
          useValue: {
            getPendingQueue: jest.fn().mockResolvedValue([{ id: "1" }]),
            reviewCase: jest
              .fn()
              .mockResolvedValue({
                id: "1",
                status: MedicalReviewStatus.APPROVED_BY_MEDICAL,
              }),
          },
        },
      ],
    }).compile();

    controller = module.get<MedicalCasesController>(MedicalCasesController);
    service = module.get(MedicalCaseService);
  });

  it("deve chamar getPendingQueue", async () => {
    const result = await controller.getPendingQueue();
    expect(service.getPendingQueue).toHaveBeenCalled();
    expect(result).toEqual([{ id: "1" }]);
  });

  it("deve chamar reviewCase com o usuário do contexto", async () => {
    const dto = { status: MedicalReviewStatus.APPROVED_BY_MEDICAL };
    const reqUser = { id: "doc-1" };

    await controller.reviewCase("c-1", dto, reqUser);
    expect(service.reviewCase).toHaveBeenCalledWith("c-1", "doc-1", dto);
  });
});
