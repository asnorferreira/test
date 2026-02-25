import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrescriptionService } from "../use-cases/prescription.service";
import { CONSTANTS, MedicalReviewStatus } from "@maemais/shared-types";
import { MedicalCaseReviewedEvent } from "../../domain/events/medical-case-reviewed.event";

@Injectable()
export class MedicalCaseReviewedListener {
  private readonly logger = new Logger(MedicalCaseReviewedListener.name);

  constructor(private readonly prescriptionService: PrescriptionService) {}

  @OnEvent(CONSTANTS.EVENTS.MEDICAL_CASE_REVIEWED, { async: true })
  async handleMedicalCaseReviewed(event: MedicalCaseReviewedEvent) {
    if (
      event.status === MedicalReviewStatus.APPROVED_BY_MEDICAL &&
      event.prescriptionDocumentUrl
    ) {
      this.logger.log(
        `Criando prescrição automática para o Caso Médico ${event.caseId}`,
      );

      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 6);

      await this.prescriptionService.createPrescription(
        event.caseId,
        event.doctorId,
        event.prescriptionDocumentUrl,
        validUntil,
      );
    }
  }
}
