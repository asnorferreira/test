import { Entity } from "@/core/domain/Entity";
import { PreAnalysisStatus, MedicalReviewStatus } from "@maemais/shared-types";

export interface AnswerProps {
  questionKey: string;
  answerValue: any;
}

export interface QuestionnaireProps {
  userId: string;
  status: MedicalReviewStatus;
  preAnalysisStatus?: PreAnalysisStatus | null;
  answers: AnswerProps[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Questionnaire extends Entity<QuestionnaireProps> {
  private constructor(props: QuestionnaireProps, id?: string) {
    super(props, id);
  }

  static create(props: QuestionnaireProps, id?: string): Questionnaire {
    return new Questionnaire(
      {
        ...props,
        status: props.status ?? MedicalReviewStatus.PENDING_MEDICAL_REVIEW,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  evaluatePreAnalysis() {
    let hasAlerts = false;
    let hasBlocks = false;

    for (const answer of this.props.answers) {
      const value = String(answer.answerValue).toLowerCase();

      if (value.includes("sangramento") || value.includes("dor extrema")) {
        hasAlerts = true;
      }
      if (value.includes("alergia grave") || value.includes("menor de idade")) {
        hasBlocks = true;
      }
    }

    if (hasBlocks) {
      this.props.preAnalysisStatus = PreAnalysisStatus.BLOQUEADA;
      this.props.status = MedicalReviewStatus.REJECTED_BY_MEDICAL;
    } else if (hasAlerts) {
      this.props.preAnalysisStatus = PreAnalysisStatus.CONDICIONAL;
      this.props.status = MedicalReviewStatus.PENDING_MEDICAL_REVIEW;
    } else {
      this.props.preAnalysisStatus = PreAnalysisStatus.APTA;
      this.props.status = MedicalReviewStatus.PENDING_MEDICAL_REVIEW;
    }
  }
}
