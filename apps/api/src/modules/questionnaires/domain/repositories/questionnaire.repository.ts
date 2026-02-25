import { Questionnaire } from "../entities/questionnaire.entity";

export abstract class QuestionnaireRepository {
  abstract create(questionnaire: Questionnaire): Promise<void>;
  abstract findById(id: string): Promise<Questionnaire | null>;
  abstract findByUserId(userId: string): Promise<Questionnaire[]>;
}
