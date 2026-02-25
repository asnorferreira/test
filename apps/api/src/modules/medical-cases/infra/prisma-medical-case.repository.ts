import { Injectable } from "@nestjs/common";
import { MedicalCaseRepository } from "../domain/repositories/medical-case.repository";
import { MedicalCase } from "../domain/entities/medical-case.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { MedicalReviewStatus } from "@maemais/shared-types";

@Injectable()
export class PrismaMedicalCaseRepository implements MedicalCaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(medicalCase: MedicalCase): Promise<void> {
    await this.prisma.medicalCase.create({
      data: {
        id: medicalCase.id,
        userId: medicalCase.props.userId,
        questionnaireId: medicalCase.props.questionnaireId,
        status: medicalCase.props.status,
      },
    });
  }

  async update(medicalCase: MedicalCase): Promise<void> {
    await this.prisma.medicalCase.update({
      where: { id: medicalCase.id },
      data: {
        doctorId: medicalCase.props.doctorId,
        status: medicalCase.props.status,
        reason: medicalCase.props.reason,
        prescriptionDocumentUrl: medicalCase.props.prescriptionDocumentUrl,
        reviewedAt: medicalCase.props.reviewedAt,
      },
    });
  }

  async findById(id: string): Promise<MedicalCase | null> {
    const raw = await this.prisma.medicalCase.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByStatus(status: MedicalReviewStatus): Promise<MedicalCase[]> {
    const raw = await this.prisma.medicalCase.findMany({
      where: { status },
      orderBy: { createdAt: "asc" },
    });
    return raw.map((item) => this.mapToDomain(item));
  }

  private mapToDomain(raw: any): MedicalCase {
    return MedicalCase.create(
      {
        userId: raw.userId,
        questionnaireId: raw.questionnaireId,
        doctorId: raw.doctorId,
        status: raw.status as MedicalReviewStatus,
        reason: raw.reason,
        prescriptionDocumentUrl: raw.prescriptionDocumentUrl,
        createdAt: raw.createdAt,
        reviewedAt: raw.reviewedAt,
      },
      raw.id,
    );
  }
}
