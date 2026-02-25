import { MedicalReviewStatus } from "@maemais/shared-types";

export class MedicalCaseReviewedEvent {
  constructor(
    public readonly caseId: string,
    public readonly userId: string,
    public readonly doctorId: string,
    public readonly status: MedicalReviewStatus,
    public readonly prescriptionDocumentUrl?: string | null,
  ) {}
}
