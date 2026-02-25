import { Test, TestingModule } from "@nestjs/testing";
import { MedicalCaseReviewedListener } from "./medical-case-reviewed.listener";
import { PrescriptionService } from "../use-cases/prescription.service";
import { MedicalReviewStatus } from "@maemais/shared-types";
import { MedicalCaseReviewedEvent } from "../../domain/events/medical-case-reviewed.event";

describe("MedicalCaseReviewedListener", () => {
  let listener: MedicalCaseReviewedListener;
  let service: jest.Mocked<PrescriptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalCaseReviewedListener,
        {
          provide: PrescriptionService,
          useValue: { createPrescription: jest.fn() },
        },
      ],
    }).compile();

    listener = module.get(MedicalCaseReviewedListener);
    service = module.get(PrescriptionService);
  });

  it("deve chamar createPrescription se o status for APPROVED e houver PDF", async () => {
    // Usando a instância real da classe para passar na tipagem
    const event = new MedicalCaseReviewedEvent(
      "c-1",
      "u-1",
      "doc-1",
      MedicalReviewStatus.APPROVED_BY_MEDICAL,
      "http://aws.s3/pdf.pdf",
    );

    await listener.handleMedicalCaseReviewed(event);

    expect(service.createPrescription).toHaveBeenCalledWith(
      "c-1",
      "doc-1",
      "http://aws.s3/pdf.pdf",
      expect.any(Date),
    );
  });

  it("NAO deve chamar createPrescription se for REJECTED", async () => {
    const event = new MedicalCaseReviewedEvent(
      "c-1",
      "u-1",
      "doc-1",
      MedicalReviewStatus.REJECTED_BY_MEDICAL,
      "http://aws.s3/pdf.pdf",
    );

    await listener.handleMedicalCaseReviewed(event);

    expect(service.createPrescription).not.toHaveBeenCalled();
  });
});
