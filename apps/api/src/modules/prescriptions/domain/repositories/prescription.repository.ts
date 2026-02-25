import { Prescription } from "../entities/prescription.entity";

export abstract class PrescriptionRepository {
  abstract create(prescription: Prescription): Promise<void>;
  abstract update(prescription: Prescription): Promise<void>;
  abstract findById(id: string): Promise<Prescription | null>;
  abstract findByDoctorId(doctorId: string): Promise<Prescription[]>;
}
