import { Module } from "@nestjs/common";
import { PrescriptionRepository } from "./domain/repositories/prescription.repository";
import { PrismaPrescriptionRepository } from "./infra/prisma-prescription.repository";
import { PrescriptionService } from "./application/use-cases/prescription.service";
import { PrescriptionsController } from "./presentation/prescriptions.controller";
import { MedicalCaseReviewedListener } from "./application/listeners/medical-case-reviewed.listener";

@Module({
  controllers: [PrescriptionsController],
  providers: [
    PrescriptionService,
    MedicalCaseReviewedListener,
    { provide: PrescriptionRepository, useClass: PrismaPrescriptionRepository },
  ],
  exports: [PrescriptionService],
})
export class PrescriptionsModule {}
