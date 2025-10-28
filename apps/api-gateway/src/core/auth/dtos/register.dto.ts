import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@/ts-shared';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com', description: 'E-mail do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'demo', description: 'Slug do tenant (empresa)' })
  @IsString()
  @IsNotEmpty()
  tenantSlug!: string;

  @ApiProperty({ example: 'strongPassword123', description: 'Senha com no mínimo 8 caracteres' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password!: string;

  @ApiProperty({ example: 'John Doe', required: false, description: 'Nome de exibição do usuário' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.ATENDENTE, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}