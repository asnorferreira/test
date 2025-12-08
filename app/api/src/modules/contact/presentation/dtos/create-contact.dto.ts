import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Sofia Almeida', description: 'Nome completo' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  fullName!: string;

  @ApiProperty({ example: 'sofia.almeida@empresa.com', description: 'E-mail de contato' })
  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @ApiProperty({ example: '(11) 99999-0000', description: 'Telefone/WhatsApp' })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  phone!: string;

  @ApiPropertyOptional({ example: 'Parceria', description: 'Assunto da mensagem' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Gostaria de saber se vocês atendem na região X...', description: 'Mensagem' })
  @IsString()
  @IsNotEmpty({ message: 'A mensagem é obrigatória.' })
  message!: string;
}