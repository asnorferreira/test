import { SubmissionStatus, TalentPoolSubmission } from "@prisma/client";
import { MySubmissionResponse } from "../../presentation/responses/my-submission.response";
import { GetTalentPoolQueryDto } from "../../presentation/dtos/get-talent-pool-query.dto";

export type CreateSubmissionDto = {
  candidateId: string;
  cvUrl: string;
  nomeCompleto: string;
  email: string;
  telefone?: string | null;
  cidade?: string | null;
  linkedinUrl?: string | null;
  areaDesejada: string;
  tipoContrato: string;
  modalidade: string;
  disponibilidade: string;
  descricaoVaga?: string | null;
};

export type PaginationResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ExportFilters = {
  status?: SubmissionStatus;
  search?: string;
};

export abstract class ITalentPoolRepository {
  abstract createSubmission(
    dto: CreateSubmissionDto
  ): Promise<TalentPoolSubmission>;

  abstract findByCandidateId(
    candidateId: string
  ): Promise<MySubmissionResponse[]>;

  abstract findAllPaginated(
    query: GetTalentPoolQueryDto
  ): Promise<PaginationResponse<TalentPoolSubmission>>;

  abstract findDetailsById(id: string): Promise<TalentPoolSubmission | null>;

  abstract updateStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<TalentPoolSubmission>;

  abstract findSubmissionsByIds(ids: string[]): Promise<TalentPoolSubmission[]>;

  abstract findAllSubmissionsByFilter(
    filters: ExportFilters
  ): Promise<TalentPoolSubmission[]>;

  abstract findSubmissionsForOpportunities(
    areas: string[],
    submissionIds?: string[]
  ): Promise<any[]>;
}
