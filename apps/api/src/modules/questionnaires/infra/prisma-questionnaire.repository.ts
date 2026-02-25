import { Injectable } from "@nestjs/common";
import { QuestionnaireRepository } from "../domain/repositories/questionnaire.repository";
import { Questionnaire } from "../domain/entities/questionnaire.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { MedicalReviewStatus, PreAnalysisStatus } from "@maemais/shared-types";

@Injectable()
export class PrismaQuestionnaireRepository implements QuestionnaireRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(questionnaire: Questionnaire): Promise<void> {
    await this.prisma.questionnaire.create({
      data: {
        id: questionnaire.id,
        userId: questionnaire.props.userId,
        status: questionnaire.props.status,
        preAnalysisStatus: questionnaire.props.preAnalysisStatus,
        answers: {
          create: questionnaire.props.answers.map((a) => ({
            questionKey: a.questionKey,
            answerValue: a.answerValue,
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<Questionnaire | null> {
    const raw = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByUserId(userId: string): Promise<Questionnaire[]> {
    const raw = await this.prisma.questionnaire.findMany({
      where: { userId },
      include: { answers: true },
      orderBy: { createdAt: "desc" },
    });
    return raw.map((item) => this.mapToDomain(item));
  }

  private mapToDomain(raw: any): Questionnaire {
    return Questionnaire.create(
      {
        userId: raw.userId,
        status: raw.status as MedicalReviewStatus,
        preAnalysisStatus: raw.preAnalysisStatus as PreAnalysisStatus,
        answers: raw.answers.map((a: any) => ({
          questionKey: a.questionKey,
          answerValue: a.answerValue,
        })),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
