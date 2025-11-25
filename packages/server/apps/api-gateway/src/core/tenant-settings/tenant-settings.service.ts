import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { UpdateTenantSettingsDto } from './dtos/update-tenant-settings.dto';

type TenantSettingsUpdatePayload = Omit<UpdateTenantSettingsDto, 'tenantId'>;

@Injectable()
export class TenantSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        widgetEnabled: true,
        defaultAiProvider: true,
        defaultAiModel: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant nao encontrado.');
    }

    return tenant;
  }

  async updateSettings(tenantId: string, payload: TenantSettingsUpdatePayload) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        widgetEnabled: payload.widgetEnabled,
        defaultAiProvider: payload.defaultAiProvider,
        defaultAiModel: payload.defaultAiModel,
      },
      select: {
        id: true,
        name: true,
        widgetEnabled: true,
        defaultAiProvider: true,
        defaultAiModel: true,
      },
    });

    return tenant;
  }
}
