import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { OidcConfig } from 'apps/backend/src/infrastructure/config/config.service';
import { passportJwtSecret } from 'jwks-rsa';
import { DecodedJwt, JwtPayload } from './jwt.payload.interface';

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(OidcStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const oidcConfig = configService.get<OidcConfig>('oidc', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: oidcConfig.audience,
      issuer: oidcConfig.issuerUrl,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${oidcConfig.issuerUrl}/.well-known/openid-configuration/jwks`,
      }),
    });

    this.logger.log(`Estratégia OIDC configurada para Issuer: ${oidcConfig.issuerUrl}`);
  }

  async validate(payload: DecodedJwt): Promise<JwtPayload> {
    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles = payload.resource_access?.[payload.aud]?.roles || [];
    
    const roles = [...realmRoles, ...clientRoles]
      .map(role => role.toUpperCase().replace('-', '_'))
      .filter(role => ['PORTARIA', 'SINDICO', 'ADMIN_TI', 'INTEGRADOR', 'ROOT'].includes(role)); 

    return {
      id: payload.sub,
      email: payload.email,
      nome: payload.name || payload.preferred_username,
      perfis: roles,
      ativo: payload.email_verified || true,
    };
  }
}