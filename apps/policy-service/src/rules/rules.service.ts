import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNegotiationRuleDto } from './dtos/create-rule.dto';
import { UpdateNegotiationRuleDto } from './dtos/update-rule.dto';
import { PrismaService } from '@/shared/database/prisma.service';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRuleDto: CreateNegotiationRuleDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createRuleDto.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID "${createRuleDto.campaignId}" não encontrada.`);
    }
    return this.prisma.negotiationRule.create({
      data: createRuleDto,
    });
  }

  findAllByCampaign(campaignId: string) {
    return this.prisma.negotiationRule.findMany({
      where: { campaignId },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.negotiationRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Regra com ID "${id}" não encontrada.`);
    }
    return rule;
  }

  async update(id: string, updateRuleDto: UpdateNegotiationRuleDto) {
    try {
      return await this.prisma.negotiationRule.update({
        where: { id },
        data: updateRuleDto,
      });
    } catch (error) {
      throw new NotFoundException(`Regra com ID "${id}" não encontrada.`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.negotiationRule.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Regra com ID "${id}" não encontrada.`);
    }
  }
}