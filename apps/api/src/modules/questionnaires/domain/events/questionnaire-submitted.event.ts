import { MedicalReviewStatus, PreAnalysisStatus } from "@maemais/shared-types";

export class QuestionnaireSubmittedEvent {
  constructor(
    public readonly questionnaireId: string,
    public readonly userId: string,
    public readonly status: MedicalReviewStatus,
    public readonly preAnalysisStatus: PreAnalysisStatus | null | undefined,
  ) {}
}
