import { CandidateProfile } from '@prisma/client';

export type UpsertProfileData = {
  nomeCompleto: string;
  telefone?: string;
  cidade?: string;
  linkedinUrl?: string;
};

export abstract class IProfilesRepository {
  abstract findByUserId(userId: string): Promise<CandidateProfile | null>;
  abstract upsert(
    userId: string,
    data: UpsertProfileData,
  ): Promise<CandidateProfile>;
}