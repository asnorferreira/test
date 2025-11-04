import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PerfilOperador } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { JwtPayload } from './jwt.payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PerfilOperador[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !user.perfis) {
      this.logger.warn(
        `RolesGuard falhou: Usuário não autenticado ou sem perfis.`,
      );
      throw new ForbiddenException('Usuário não autenticado');
    }

    const hasRole = requiredRoles.some((role) => user.perfis.includes(role));

    if (hasRole) {
      return true;
    }

    this.logger.warn(
      `Acesso negado (RBAC) para usuário [${user.email}] (ID: ${user.id}). 
       Perfis Requeridos: [${requiredRoles.join(', ')}]. 
       Perfis do Usuário: [${user.perfis.join(', ')}]`,
    );

    throw new ForbiddenException(
      'O usuário não possui permissão para acessar este recurso',
    );
  }
}