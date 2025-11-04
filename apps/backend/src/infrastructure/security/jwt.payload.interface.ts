import { PerfilOperador } from '@prisma/client';

export interface DecodedJwt {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  aud: string;
  iss: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
  // Outras claims...
}

export interface JwtPayload {
  id: string; 
  email: string;
  nome: string;
  ativo: boolean;
  perfis: PerfilOperador[];
}