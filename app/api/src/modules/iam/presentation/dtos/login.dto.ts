import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'candidato@email.com',
    description: 'E-mail de login',
  })
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @ApiProperty({ example: 'S3nh@Fort3!', description: 'Senha de acesso' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;
}