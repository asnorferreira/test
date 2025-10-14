import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '@/ts-shared';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'updated.user@example.com',
    description: 'Novo e-mail do usuário.',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'newStrongPassword',
    description: 'Nova senha, com no mínimo 8 caracteres.',
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: 'Jane Smith',
    description: 'Novo nome de exibição do usuário.',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Novo nível de acesso do usuário.',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Novo status da conta do usuário.',
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}