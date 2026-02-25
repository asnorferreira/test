import { MedicalCase } from "../entities/medical-case.entity";
import { MedicalReviewStatus } from "@maemais/shared-types";

export abstract class MedicalCaseRepository {
  abstract create(medicalCase: MedicalCase): Promise<void>;
  abstract update(medicalCase: MedicalCase): Promise<void>;
  abstract findById(id: string): Promise<MedicalCase | null>;
  abstract findByStatus(status: MedicalReviewStatus): Promise<MedicalCase[]>;
}
