import { Module } from "@nestjs/common";
import { MedicalCaseRepository } from "./domain/repositories/medical-case.repository";
import { PrismaMedicalCaseRepository } from "./infra/prisma-medical-case.repository";
import { MedicalCaseService } from "./application/use-cases/medical-case.service";
import { MedicalCasesController } from "./presentation/medical-cases.controller";
import { QuestionnaireSubmittedListener } from "./application/listeners/questionnaire-submitted.listener";

@Module({
  controllers: [MedicalCasesController],
  providers: [
    MedicalCaseService,
    QuestionnaireSubmittedListener,
    {
      provide: MedicalCaseRepository,
      useClass: PrismaMedicalCaseRepository,
    },
  ],
  exports: [MedicalCaseService],
})
export class MedicalCasesModule {}
