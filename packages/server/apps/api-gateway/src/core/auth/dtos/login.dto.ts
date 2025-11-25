import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com', description: 'E-mail do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'demo', description: 'Slug do tenant (empresa)' })
  @IsString()
  @IsNotEmpty()
  tenantSlug!: string;

  @ApiProperty({ example: 'strongPassword123', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}