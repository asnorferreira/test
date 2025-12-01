import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MatchPassword } from './match-password.validator';

export class RegisterCandidateDto {
  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome completo do candidato',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  fullName!: string; 

  @ApiProperty({
    example: 'candidato@email.com',
    description: 'E-mail único do candidato',
  })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string; 

  @ApiProperty({
    example: 'S3nh@Fort3!',
    description: 'Senha de acesso (mínimo 8 caracteres)',
  })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  password!: string; 

  @ApiProperty({
    example: 'S3nh@Fort3!',
    description: 'Confirmação da senha',
  })
  @IsString()
  @MinLength(8, { message: 'A confirmação de senha deve ter no mínimo 8 caracteres.' })
  @MatchPassword('password', { message: 'As senhas não conferem.' })
  confirmPassword!: string; 
}