import { Entity } from "@/core/domain/Entity";
import { PrescriptionStatus } from "@maemais/shared-types";

export interface PrescriptionProps {
  medicalCaseId: string;
  doctorId: string;
  status: PrescriptionStatus;
  documentUrl: string;
  createdAt?: Date;
  validUntil?: Date | null;
}

export class Prescription extends Entity<PrescriptionProps> {
  private constructor(props: PrescriptionProps, id?: string) {
    super(props, id);
  }

  static create(props: PrescriptionProps, id?: string): Prescription {
    return new Prescription(
      {
        ...props,
        status: props.status ?? PrescriptionStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  cancel() {
    this.props.status = PrescriptionStatus.CANCELLED;
  }
}
