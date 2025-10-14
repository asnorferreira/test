import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '@/ts-shared';

export class CreateUserDto {
  @ApiProperty({
    example: 'new.user@example.com',
    description: 'E-mail único do usuário dentro do tenant.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'ID do tenant ao qual o usuário pertence.',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Senha do usuário, com no mínimo 8 caracteres.',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Nome de exibição do usuário.',
    required: false,
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Nível de acesso do usuário.',
    default: UserRole.ATENDENTE,
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.ATENDENTE;

  @ApiProperty({
    enum: UserStatus,
    description: 'Status da conta do usuário (ativo, pendente, etc.).',
    default: UserStatus.ACTIVE,
    required: false,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
