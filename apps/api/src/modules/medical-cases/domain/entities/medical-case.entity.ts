import { Entity } from "@/core/domain/Entity";
import { MedicalReviewStatus } from "@maemais/shared-types";

export interface MedicalCaseProps {
  userId: string;
  questionnaireId: string;
  doctorId?: string | null;
  status: MedicalReviewStatus;
  reason?: string | null;
  prescriptionDocumentUrl?: string | null;
  createdAt?: Date;
  reviewedAt?: Date | null;
}

export class MedicalCase extends Entity<MedicalCaseProps> {
  private constructor(props: MedicalCaseProps, id?: string) {
    super(props, id);
  }

  static create(props: MedicalCaseProps, id?: string): MedicalCase {
    return new MedicalCase(
      {
        ...props,
        status: props.status ?? MedicalReviewStatus.PENDING_MEDICAL_REVIEW,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  review(
    doctorId: string,
    status: MedicalReviewStatus,
    reason?: string,
    documentUrl?: string,
  ) {
    this.props.doctorId = doctorId;
    this.props.status = status;
    this.props.reason = reason;
    if (documentUrl) this.props.prescriptionDocumentUrl = documentUrl;
    this.props.reviewedAt = new Date();
  }
}
