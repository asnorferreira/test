import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { UpdateScriptDto } from './dtos/update-script.dto';
import { CreateScriptDto } from './dtos/create-script.dto';

@Injectable()
export class ScriptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createScriptDto: CreateScriptDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createScriptDto.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID "${createScriptDto.campaignId}" não encontrada.`);
    }

    return this.prisma.script.create({
      data: {
        ...createScriptDto,
        version: 1,
      },
    });
  }

  findAllByCampaign(campaignId: string) {
    return this.prisma.script.findMany({
      where: { campaignId },
      orderBy: { category: 'asc' },
    });
  }

  async findOne(id: string) {
    const script = await this.prisma.script.findUnique({ where: { id } });
    if (!script) {
      throw new NotFoundException(`Script com ID "${id}" não encontrado.`);
    }
    return script;
  }

  async update(id: string, updateScriptDto: UpdateScriptDto) {
    try {
      return await this.prisma.script.update({
        where: { id },
        data: updateScriptDto,
      });
    } catch (error) {
      throw new NotFoundException(`Script com ID "${id}" não encontrado.`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.script.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Script com ID "${id}" não encontrado.`);
    }
  }
}