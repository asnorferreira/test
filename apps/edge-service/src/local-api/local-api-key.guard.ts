import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { EdgeConfigService } from '../config/edge-config.service';

@Injectable()
export class LocalApiKeyGuard implements CanActivate {
  private readonly localKey: string;
  constructor(private readonly config: EdgeConfigService) {
    this.localKey = config.getLocalApiKey();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-edge-api-key'];

    if (key === this.localKey) {
      return true;
    }
    
    throw new UnauthorizedException('Chave de API (Edge) inválida');
  }
}