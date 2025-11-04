import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { OidcStrategy } from './oidc.strategy';
import { OidcAuthGuard } from './oidc-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ConfigModule,
  ],
  providers: [OidcStrategy, OidcAuthGuard, RolesGuard],
  exports: [OidcAuthGuard, RolesGuard, PassportModule],
})
export class SecurityModule {}