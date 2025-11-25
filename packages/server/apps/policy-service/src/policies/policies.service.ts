import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { UpdatePolicyDto } from './dtos/update-policy.dto';

@Injectable()
export class PoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(campaignId: string, publisherEmail: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID "${campaignId}" não encontrada.`);
    }

    const [rules, pillars, scripts] = await Promise.all([
      this.prisma.negotiationRule.findMany({ where: { campaignId } }),
      this.prisma.pillar.findMany({ where: { campaignId } }),
      this.prisma.script.findMany({ where: { campaignId, isActive: true } }),
    ]);

    const policyBody = { rules, pillars, scripts, publishedAt: new Date() };

    const lastPolicy = await this.prisma.policy.findFirst({
      where: { campaignId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastPolicy?.version || 0) + 1;

    return this.prisma.$transaction(async (tx) => {
      await tx.policy.updateMany({
        where: { campaignId, isActive: true },
        data: { isActive: false },
      });

      const newPolicy = await tx.policy.create({
        data: {
          campaignId,
          version: newVersion,
          body: policyBody,
          isActive: true,
          publishedBy: publisherEmail,
          tenantId: campaign.tenantId,
        },
      });

      return newPolicy;
    });
  }

  async findActiveByCampaign(campaignId: string) {
    const policy = await this.prisma.policy.findFirst({
      where: { campaignId, isActive: true },
    });
    if (!policy) {
        throw new NotFoundException(`Nenhuma política ativa encontrada para a campanha ${campaignId}`);
    }
    return policy;
  }
  
  async findAllByCampaign(campaignId: string) {
    return this.prisma.policy.findMany({
      where: { campaignId },
      orderBy: { version: 'desc' },
    });
  }
  
  async update(id: string, updatePolicyDto: UpdatePolicyDto) {
    try {
      return await this.prisma.policy.update({
        where: { id },
        data: updatePolicyDto,
      });
    } catch (error) {
      throw new NotFoundException(`Política com ID "${id}" não encontrada.`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.policy.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Política com ID "${id}" não encontrada.`);
    }
  }
}