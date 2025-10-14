import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { CreatePillarDto } from './dtos/create-pillar.dto';
import { UpdatePillarDto } from './dtos/update-pillar.dto';

@Injectable()
export class PillarsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPillarDto: CreatePillarDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createPillarDto.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID "${createPillarDto.campaignId}" não encontrada.`);
    }

    return this.prisma.pillar.create({
      data: createPillarDto,
    });
  }

  findAllByCampaign(campaignId: string) {
    return this.prisma.pillar.findMany({
      where: { campaignId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const pillar = await this.prisma.pillar.findUnique({ where: { id } });
    if (!pillar) {
      throw new NotFoundException(`Pilar com ID "${id}" não encontrado.`);
    }
    return pillar;
  }

  async update(id: string, updatePillarDto: UpdatePillarDto) {
    try {
      return await this.prisma.pillar.update({
        where: { id },
        data: updatePillarDto,
      });
    } catch (error) {
      throw new NotFoundException(`Pilar com ID "${id}" não encontrado.`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.pillar.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Pilar com ID "${id}" não encontrado.`);
    }
  }
}