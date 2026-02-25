import { Test, TestingModule } from "@nestjs/testing";
import { QuestionnaireSubmittedListener } from "./questionnaire-submitted.listener";
import { MedicalCaseRepository } from "../../domain/repositories/medical-case.repository";
import { PreAnalysisStatus, MedicalReviewStatus } from "@maemais/shared-types";

describe("QuestionnaireSubmittedListener", () => {
  let listener: QuestionnaireSubmittedListener;
  let repo: jest.Mocked<MedicalCaseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnaireSubmittedListener,
        { provide: MedicalCaseRepository, useValue: { create: jest.fn() } },
      ],
    }).compile();

    listener = module.get(QuestionnaireSubmittedListener);
    repo = module.get(MedicalCaseRepository);
  });

  it("deve criar um caso pendente quando o questionário for APTA", async () => {
    await listener.handleQuestionnaireSubmitted({
      questionnaireId: "q-1",
      userId: "u-1",
      preAnalysisStatus: PreAnalysisStatus.APTA,
    });

    expect(repo.create).toHaveBeenCalled();
    const createdCase = repo.create.mock.calls[0][0];
    expect(createdCase.props.status).toBe(
      MedicalReviewStatus.PENDING_MEDICAL_REVIEW,
    );
  });

  it("deve criar um caso já recusado quando o questionário for BLOQUEADA", async () => {
    await listener.handleQuestionnaireSubmitted({
      questionnaireId: "q-2",
      userId: "u-2",
      preAnalysisStatus: PreAnalysisStatus.BLOQUEADA,
    });

    const createdCase = repo.create.mock.calls[0][0];
    expect(createdCase.props.status).toBe(
      MedicalReviewStatus.REJECTED_BY_MEDICAL,
    );
  });
});
