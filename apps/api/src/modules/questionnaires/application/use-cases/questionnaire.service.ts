import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { QuestionnaireRepository } from "../../domain/repositories/questionnaire.repository";
import { Questionnaire } from "../../domain/entities/questionnaire.entity";
import { SubmitQuestionnaireDto } from "../dtos/submit-questionnaire.dto";
import { QuestionnaireSubmittedEvent } from "../../domain/events/questionnaire-submitted.event";

@Injectable()
export class QuestionnaireService {
  private readonly logger = new Logger(QuestionnaireService.name);

  constructor(
    private readonly repo: QuestionnaireRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submit(userId: string, dto: SubmitQuestionnaireDto) {
    const questionnaire = Questionnaire.create({
      userId,
      answers: dto.answers,
      status: "PENDING_MEDICAL_REVIEW" as any,
    });

    questionnaire.evaluatePreAnalysis();

    await this.repo.create(questionnaire);

    this.logger.log(
      `Questionário [${questionnaire.id}] submetido. Disparando evento...`,
    );

    this.eventEmitter.emit(
      "questionnaire.submitted",
      new QuestionnaireSubmittedEvent(
        questionnaire.id,
        userId,
        questionnaire.props.status,
        questionnaire.props.preAnalysisStatus,
      ),
    );

    return {
      id: questionnaire.id,
      preAnalysisStatus: questionnaire.props.preAnalysisStatus,
      status: questionnaire.props.status,
    };
  }

  async getUserHistory(userId: string) {
    const history = await this.repo.findByUserId(userId);
    return history.map((q) => ({
      id: q.id,
      status: q.props.status,
      preAnalysisStatus: q.props.preAnalysisStatus,
      createdAt: q.props.createdAt,
    }));
  }
}
