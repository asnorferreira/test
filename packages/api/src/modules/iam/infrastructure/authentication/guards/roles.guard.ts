import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, ROLES_HIERARCHY } from '@jsp/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { ActiveUserData } from '../strategies/jwt.strategy';

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

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: ActiveUserData }>();
    if (!user || !user.role) {
      return false;
    }

    const userRoleLevel = ROLES_HIERARCHY[user.role];
    const requiredRoleLevel = Math.min(
      ...requiredRoles.map((role) => ROLES_HIERARCHY[role]),
    );

    return userRoleLevel >= requiredRoleLevel;
  }
}