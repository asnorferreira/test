import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MedicalCaseRepository } from "../../domain/repositories/medical-case.repository";
import { MedicalCase } from "../../domain/entities/medical-case.entity";
import {
  CONSTANTS,
  MedicalReviewStatus,
  PreAnalysisStatus,
} from "@maemais/shared-types";

@Injectable()
export class QuestionnaireSubmittedListener {
  private readonly logger = new Logger(QuestionnaireSubmittedListener.name);

  constructor(private readonly repo: MedicalCaseRepository) {}

  @OnEvent(CONSTANTS.EVENTS.QUESTIONNAIRE_SUBMITTED, { async: true })
  async handleQuestionnaireSubmitted(event: any) {
    this.logger.log(
      `Processando criação de Caso Médico para o questionário: ${event.questionnaireId}`,
    );

    const status =
      event.preAnalysisStatus === PreAnalysisStatus.BLOQUEADA
        ? MedicalReviewStatus.REJECTED_BY_MEDICAL
        : MedicalReviewStatus.PENDING_MEDICAL_REVIEW;

    const medicalCase = MedicalCase.create({
      userId: event.userId,
      questionnaireId: event.questionnaireId,
      status,
    });

    await this.repo.create(medicalCase);
    this.logger.log(
      `Caso Médico criado com sucesso: ${medicalCase.id} [Status: ${status}]`,
    );
  }
}
