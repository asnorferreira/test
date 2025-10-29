import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateCampaignDto } from './dtos/create-campaign.dto';
import { UpdateCampaignDto } from './dtos/update-campaign.dto';

type CurrentUser = { id: string; tenantId: string; role: UserRole };

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto, currentUser: CurrentUser) {
    this.logger.log(`[${currentUser.tenantId}] criando campanha: ${createCampaignDto.name}`);

    if (currentUser.role !== UserRole.ADMIN && createCampaignDto.tenantId !== currentUser.tenantId) {
      throw new ForbiddenException('Acesso negado.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: createCampaignDto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant com ID "${createCampaignDto.tenantId}" não encontrado.`);
    }

    return this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        tenantId: currentUser.tenantId,
      },
    });
  }

  async findAll(currentUser: CurrentUser) {
    const where = currentUser.role === UserRole.ADMIN 
      ? {} 
      : { tenantId: currentUser.tenantId };

    return this.prisma.campaign.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });
    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada.');
    }

    if (currentUser.role !== UserRole.ADMIN && campaign.tenantId !== currentUser.tenantId) {
      this.logger.warn(`[${currentUser.tenantId}] tentou acessar campanha de outro tenant [${campaign.tenantId}]`);
      throw new ForbiddenException('Acesso negado a este recurso.');
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto, currentUser: CurrentUser) {
    await this.findOne(id, currentUser);
    this.logger.log(`[${currentUser.tenantId}] atualizando campanha: ${id}`);

    return this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
    });
  }

  async remove(id: string, currentUser: CurrentUser) {
    await this.findOne(id, currentUser);
    
    if (currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Apenas administradores podem remover campanhas.');
    }
    this.logger.log(`[${currentUser.tenantId}] removendo campanha: ${id}`);
    try {
      await this.prisma.campaign.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Campanha com ID "${id}" não encontrada.`);
    }
  }
}
