import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ActiveUserData } from '../strategies/jwt.strategy';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: ActiveUserData = request.user;
    return field ? user?.[field] : user;
  },
);