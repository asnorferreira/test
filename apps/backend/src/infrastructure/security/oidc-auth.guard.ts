import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OidcAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(OidcAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`Autenticação falhou: ${info?.message || err?.message}`);
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}