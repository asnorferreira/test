import { Injectable } from "@nestjs/common";
import { PrescriptionRepository } from "../domain/repositories/prescription.repository";
import { Prescription } from "../domain/entities/prescription.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrescriptionStatus } from "@maemais/shared-types";

@Injectable()
export class PrismaPrescriptionRepository implements PrescriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(prescription: Prescription): Promise<void> {
    await this.prisma.prescription.create({
      data: {
        id: prescription.id,
        medicalCaseId: prescription.props.medicalCaseId,
        doctorId: prescription.props.doctorId,
        status: prescription.props.status,
        documentUrl: prescription.props.documentUrl,
        validUntil: prescription.props.validUntil,
      },
    });
  }

  async update(prescription: Prescription): Promise<void> {
    await this.prisma.prescription.update({
      where: { id: prescription.id },
      data: { status: prescription.props.status },
    });
  }

  async findById(id: string): Promise<Prescription | null> {
    const raw = await this.prisma.prescription.findUnique({ where: { id } });
    if (!raw) return null;
    return Prescription.create(
      {
        medicalCaseId: raw.medicalCaseId,
        doctorId: raw.doctorId,
        status: raw.status as PrescriptionStatus,
        documentUrl: raw.documentUrl,
        validUntil: raw.validUntil,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  async findByDoctorId(doctorId: string): Promise<Prescription[]> {
    const raw = await this.prisma.prescription.findMany({
      where: { doctorId },
    });
    return raw.map((r) =>
      Prescription.create(
        {
          medicalCaseId: r.medicalCaseId,
          doctorId: r.doctorId,
          status: r.status as PrescriptionStatus,
          documentUrl: r.documentUrl,
          validUntil: r.validUntil,
          createdAt: r.createdAt,
        },
        r.id,
      ),
    );
  }
}
