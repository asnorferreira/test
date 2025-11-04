import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IMessageBus } from 'apps/backend/src/interfaces/outbound/message-bus.port';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'apps/backend/src/infrastructure/security/jwt.payload.interface';

// Decorator
export const Audit = (acao: string, recursoTipo: string) => 
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('audit_acao', acao, descriptor.value);
    Reflect.defineMetadata('audit_recurso', recursoTipo, descriptor.value);
    return descriptor;
  };

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly auditTopic: string;

  constructor(
    private readonly messageBus: IMessageBus,
    private readonly configService: ConfigService,
  ) {
    this.auditTopic = this.configService.get<string>(
      'services.messageBus.topics.auditTrail',
      { infer: true },
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const acao = Reflect.getMetadata('audit_acao', handler);
    
    if (!acao) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    const body = request.body;
    const params = request.params;

    const recursoTipo = Reflect.getMetadata('audit_recurso', handler);
    const recursoId = params.id || null;

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logAudit(user, acao, recursoTipo, recursoId, body, data);
        },
        error: (error) => {
          this.logAudit(user, acao, recursoTipo, recursoId, body, null, error);
        },
      }),
    );
  }

  private logAudit(
    user: JwtPayload,
    acao: string,
    recursoTipo: string,
    recursoId: string | null,
    payload: any,
    response: any,
    error?: Error,
  ) {
    this.messageBus.publish(this.auditTopic, {
      operadorId: user.id,
      operadorNome: user.nome,
      acao,
      recursoTipo,
      recursoId,
      dadosNovos: payload,
      sucesso: !error,
      erro: error ? error.message : null,
      timestamp: new Date().toISOString(),
    });
  }
}