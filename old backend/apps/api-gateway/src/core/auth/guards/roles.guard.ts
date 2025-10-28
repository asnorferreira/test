import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/ts-shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    
    const userEffectiveRole = user.role === UserRole.QA ? UserRole.SUPERVISOR : user.role;
    if (requiredRoles.includes(userEffectiveRole)) {
        return true;
    }
    if (userEffectiveRole === UserRole.SUPERVISOR && requiredRoles.includes(UserRole.ATENDENTE)) {
        return true;
    }

    return false;
  }
}