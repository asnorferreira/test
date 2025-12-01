import { Injectable } from '@nestjs/common';
import {
  IProfilesRepository,
  UpsertProfileData,
} from '../../application/ports/i-profiles.repository';
import { CandidateProfile } from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';

@Injectable()
export class ProfilesRepository implements IProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<CandidateProfile | null> {
    return this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
  }

  async upsert(
    userId: string,
    data: UpsertProfileData,
  ): Promise<CandidateProfile> {
    return this.prisma.candidateProfile.upsert({
      where: { userId },
      update: {
        ...data,
      },
      create: {
        userId: userId,
        ...data,
      },
    });
  }
}