import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NotFoundException } from "@nestjs/common";
import { MedicalCaseService } from "./medical-case.service";
import { MedicalCaseRepository } from "../../domain/repositories/medical-case.repository";
import { MedicalCase } from "../../domain/entities/medical-case.entity";
import { CONSTANTS, MedicalReviewStatus } from "@maemais/shared-types";

describe("MedicalCaseService", () => {
  let service: MedicalCaseService;
  let repo: jest.Mocked<MedicalCaseRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalCaseService,
        {
          provide: MedicalCaseRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            findByStatus: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalCaseService>(MedicalCaseService);
    repo = module.get(MedicalCaseRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  it("deve avaliar o caso médico, atualizar no banco e disparar evento", async () => {
    const mockCase = MedicalCase.create({
      userId: "u-1",
      questionnaireId: "q-1",
      status: MedicalReviewStatus.PENDING_MEDICAL_REVIEW,
    });
    repo.findById.mockResolvedValue(mockCase);

    const dto = {
      status: MedicalReviewStatus.APPROVED_BY_MEDICAL,
      prescriptionDocumentUrl: "http://pdf.com",
    };
    const result = await service.reviewCase("c-1", "doc-1", dto);

    expect(repo.update).toHaveBeenCalled();
    expect(result.status).toBe(MedicalReviewStatus.APPROVED_BY_MEDICAL);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      CONSTANTS.EVENTS.MEDICAL_CASE_REVIEWED,
      expect.objectContaining({
        caseId: mockCase.id,
        userId: "u-1",
        status: MedicalReviewStatus.APPROVED_BY_MEDICAL,
        prescriptionDocumentUrl: "http://pdf.com",
      }),
    );
  });

  it("deve lançar NotFoundException se caso não existir", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      service.reviewCase("invalid", "doc-1", {
        status: MedicalReviewStatus.APPROVED_BY_MEDICAL,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
