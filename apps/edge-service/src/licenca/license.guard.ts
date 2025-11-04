import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseAgentService } from './license-agent.service';
import { ModuloLicenca } from '@prisma/client';

export const REQUIRED_MODULE_KEY = 'required_module';

/**
 * Decorator: @RequireModule(ModuloLicenca.FACIAL)
 */
export const RequireModule = (modulo: ModuloLicenca) =>
  SetMetadata(REQUIRED_MODULE_KEY, modulo);

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly licenseAgent: LicenseAgentService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Verifica se o Core (acesso básico) está ativo
    if (!this.licenseAgent.isCoreActive()) {
      throw new ForbiddenException('Licença de acesso principal inválida ou expirada');
    }

    // 2. Verifica se a rota exige um módulo específico (ex: Facial)
    const requiredModule = this.reflector.get<ModuloLicenca>(
      REQUIRED_MODULE_KEY,
      context.getHandler(),
    );

    if (requiredModule) {
      if (!this.licenseAgent.isModuleLicensed(requiredModule)) {
        throw new ForbiddenException(
          `Módulo [${requiredModule}] não licenciado ou expirado`,
        );
      }
    }

    return true;
  }
}