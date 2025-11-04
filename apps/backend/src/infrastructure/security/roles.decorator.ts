import { SetMetadata } from '@nestjs/common';
import { PerfilOperador } from '@prisma/client';

export const ROLES_KEY = 'perfis';

export const Roles = (...perfis: PerfilOperador[]) =>
  SetMetadata(ROLES_KEY, perfis);