import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrescriptionRepository } from "../../domain/repositories/prescription.repository";
import { Prescription } from "../../domain/entities/prescription.entity";
import { PrescriptionStatus } from "@maemais/shared-types";

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  constructor(private readonly repo: PrescriptionRepository) {}

  async createPrescription(
    medicalCaseId: string,
    doctorId: string,
    documentUrl: string,
    validUntil?: Date,
  ) {
    const prescription = Prescription.create({
      medicalCaseId,
      doctorId,
      documentUrl,
      validUntil,
      status: PrescriptionStatus.ACTIVE,
    });

    await this.repo.create(prescription);
    this.logger.log(
      `Prescrição ${prescription.id} criada para o caso ${medicalCaseId}`,
    );
    return prescription;
  }

  async cancelPrescription(id: string, doctorId: string) {
    const prescription = await this.repo.findById(id);
    if (!prescription || prescription.props.doctorId !== doctorId) {
      throw new NotFoundException(
        "Prescrição não encontrada ou você não tem permissão.",
      );
    }

    prescription.cancel();
    await this.repo.update(prescription);

    this.logger.log(
      `Prescrição ${prescription.id} cancelada pelo médico ${doctorId}`,
    );
    return { id: prescription.id, status: prescription.props.status };
  }

  async getMyPrescriptions(doctorId: string) {
    const result = await this.repo.findByDoctorId(doctorId);
    return result.map((p) => ({
      id: p.id,
      medicalCaseId: p.props.medicalCaseId,
      status: p.props.status,
      documentUrl: p.props.documentUrl,
      createdAt: p.props.createdAt,
    }));
  }
}
