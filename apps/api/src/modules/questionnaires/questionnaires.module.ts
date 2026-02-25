import { Module } from "@nestjs/common";
import { QuestionnaireRepository } from "./domain/repositories/questionnaire.repository";
import { PrismaQuestionnaireRepository } from "./infra/prisma-questionnaire.repository";
import { QuestionnaireService } from "./application/use-cases/questionnaire.service";
import { QuestionnairesController } from "./presentation/questionnaires.controller";

@Module({
  controllers: [QuestionnairesController],
  providers: [
    QuestionnaireService,
    {
      provide: QuestionnaireRepository,
      useClass: PrismaQuestionnaireRepository,
    },
  ],
  exports: [QuestionnaireService],
})
export class QuestionnairesModule {}
