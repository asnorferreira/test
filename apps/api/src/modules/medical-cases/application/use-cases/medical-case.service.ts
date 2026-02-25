import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MedicalCaseRepository } from "../../domain/repositories/medical-case.repository";
import { ReviewCaseDto } from "../dtos/review-case.dto";
import { CONSTANTS, MedicalReviewStatus } from "@maemais/shared-types";
import { MedicalCaseReviewedEvent } from "../../domain/events/medical-case-reviewed.event";

@Injectable()
export class MedicalCaseService {
  private readonly logger = new Logger(MedicalCaseService.name);

  constructor(
    private readonly repo: MedicalCaseRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getPendingQueue() {
    const cases = await this.repo.findByStatus(
      MedicalReviewStatus.PENDING_MEDICAL_REVIEW,
    );
    return cases.map((c) => ({
      id: c.id,
      userId: c.props.userId,
      questionnaireId: c.props.questionnaireId,
      createdAt: c.props.createdAt,
    }));
  }

  async reviewCase(caseId: string, doctorId: string, dto: ReviewCaseDto) {
    const medicalCase = await this.repo.findById(caseId);
    if (!medicalCase)
      throw new NotFoundException("Caso médico não encontrado.");

    medicalCase.review(
      doctorId,
      dto.status,
      dto.reason,
      dto.prescriptionDocumentUrl,
    );

    await this.repo.update(medicalCase);

    this.logger.log(
      `Caso Médico ${caseId} avaliado como ${dto.status} pelo médico ${doctorId}.`,
    );

    this.eventEmitter.emit(
      CONSTANTS.EVENTS.MEDICAL_CASE_REVIEWED,
      new MedicalCaseReviewedEvent(
        medicalCase.id,
        medicalCase.props.userId,
        medicalCase.props.status,
        medicalCase.props.prescriptionDocumentUrl,
      ),
    );

    return {
      id: medicalCase.id,
      status: medicalCase.props.status,
      reviewedAt: medicalCase.props.reviewedAt,
    };
  }
}
