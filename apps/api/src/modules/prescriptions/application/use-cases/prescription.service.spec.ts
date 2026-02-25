import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PrescriptionService } from "./prescription.service";
import { PrescriptionRepository } from "../../domain/repositories/prescription.repository";
import { Prescription } from "../../domain/entities/prescription.entity";
import { PrescriptionStatus } from "@maemais/shared-types";

describe("PrescriptionService", () => {
  let service: PrescriptionService;
  let repo: jest.Mocked<PrescriptionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionService,
        {
          provide: PrescriptionRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            findByDoctorId: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<PrescriptionService>(PrescriptionService);
    repo = module.get(PrescriptionRepository);
  });

  describe("createPrescription", () => {
    it("deve criar uma prescrição com status ACTIVE", async () => {
      const result = await service.createPrescription(
        "case-1",
        "doc-1",
        "url.pdf",
      );
      expect(repo.create).toHaveBeenCalled();
      expect(result.props.status).toBe(PrescriptionStatus.ACTIVE);
      expect(result.props.doctorId).toBe("doc-1");
    });
  });

  describe("cancelPrescription", () => {
    it("deve cancelar a prescrição", async () => {
      const mockPrescription = Prescription.create({
        medicalCaseId: "c-1",
        doctorId: "doc-1",
        documentUrl: "url",
        status: PrescriptionStatus.ACTIVE,
      });
      repo.findById.mockResolvedValue(mockPrescription);

      const result = await service.cancelPrescription(
        mockPrescription.id,
        "doc-1",
      );
      expect(repo.update).toHaveBeenCalled();
      expect(result.status).toBe(PrescriptionStatus.CANCELLED);
    });

    it("deve lançar erro se tentar cancelar receita de outro médico", async () => {
      const mockPrescription = Prescription.create({
        medicalCaseId: "c-1",
        doctorId: "doc-1",
        documentUrl: "url",
        status: PrescriptionStatus.ACTIVE,
      });
      repo.findById.mockResolvedValue(mockPrescription);

      await expect(
        service.cancelPrescription(mockPrescription.id, "OUTRO_MEDICO"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
