import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { CreateProposalDto } from '../../presentation/dtos/create-proposal.dto';
import { CommercialLead } from '@prisma/client';

@Injectable()
export class CommercialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProposalDto): Promise<CommercialLead> {
    return this.prisma.commercialLead.create({
      data: {
        fullName: data.fullName,
        position: data.position,
        email: data.email,
        phone: data.phone,
        company: data.company,
        sector: data.sector,
        services: data.services,
        estimatedHeadcount: data.estimatedHeadcount,
        needsDescription: data.needsDescription || null,
      },
    });
  }
}