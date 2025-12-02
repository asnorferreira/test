import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import {
  CreateSubmissionDto,
  ExportFilters,
  ITalentPoolRepository,
  PaginationResponse,
} from '../../application/ports/i-talent-pool.repository';
import { Prisma, SubmissionStatus, TalentPoolSubmission } from '@prisma/client';
import { MySubmissionResponse } from '../../presentation/responses/my-submission.response';
import { GetTalentPoolQueryDto } from '../../presentation/dtos/get-talent-pool-query.dto';

@Injectable()
export class TalentPoolRepository implements ITalentPoolRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSubmission(
    dto: CreateSubmissionDto,
  ): Promise<TalentPoolSubmission> {
    return this.prisma.talentPoolSubmission.create({
      data: {
        candidateId: dto.candidateId,
        cvUrl: dto.cvUrl,
        nomeCompleto: dto.nomeCompleto,
        email: dto.email,
        telefone: dto.telefone,
        cidade: dto.cidade,
        linkedinUrl: dto.linkedinUrl,
        areaDesejada: dto.areaDesejada,
        tipoContrato: dto.tipoContrato,
        modalidade: dto.modalidade,
        disponibilidade: dto.disponibilidade,
        descricaoVaga: dto.descricaoVaga,
        status: SubmissionStatus.NOVO,
      },
    });
  }

  async findByCandidateId(
    candidateId: string,
  ): Promise<MySubmissionResponse[]> {
    return this.prisma.talentPoolSubmission.findMany({
      where: { candidateId },
      select: {
        id: true,
        submissionId: true,
        areaDesejada: true,
        status: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findAllPaginated(
    query: GetTalentPoolQueryDto,
  ): Promise<PaginationResponse<TalentPoolSubmission>> {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TalentPoolSubmissionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nomeCompleto: { contains: search, mode: 'insensitive' } },
        { submissionId: { contains: search, mode: 'insensitive' } },
        { areaDesejada: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [submissions, total] = await this.prisma.$transaction([
        this.prisma.talentPoolSubmission.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            updatedAt: 'desc',
          },
        }),
        this.prisma.talentPoolSubmission.count({ where }),
      ]);

      return {
        data: submissions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: unknown) {
      console.error('Falha na transação de paginação:', err);
      throw new InternalServerErrorException('Erro ao buscar dados do banco.');
    }
  }

  async findDetailsById(id: string): Promise<TalentPoolSubmission | null> {
    const submission = await this.prisma.talentPoolSubmission.findUnique({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException('Submissão não encontrada.');
    }
    return submission;
  }

  async updateStatus(
    id: string,
    status: SubmissionStatus,
  ): Promise<TalentPoolSubmission> {
    const existing = await this.prisma.talentPoolSubmission.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Submissão não encontrada.');
    }
    return this.prisma.talentPoolSubmission.update({
      where: { id },
      data: { status },
    });
  }

  async findSubmissionsByIds(
    ids: string[],
  ): Promise<TalentPoolSubmission[]> {
    return this.prisma.talentPoolSubmission.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async findAllSubmissionsByFilter(
    filters: ExportFilters,
  ): Promise<TalentPoolSubmission[]> {
    const where: Prisma.TalentPoolSubmissionWhereInput = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.OR = [
        { nomeCompleto: { contains: filters.search, mode: 'insensitive' } },
        { submissionId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.talentPoolSubmission.findMany({ where });
  }
}