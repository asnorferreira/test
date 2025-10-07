import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  tenantSlug!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsEnum(UserRole)
  role: UserRole = UserRole.ATENDENTE;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}