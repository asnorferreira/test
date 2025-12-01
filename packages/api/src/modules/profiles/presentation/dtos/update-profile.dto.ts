import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Nome completo do candidato (Passo 2)',
    example: 'Maria Oliveira da Silva',
  })
  @IsString({ message: 'O nome completo deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  nomeCompleto!: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato com DDD',
    example: '(81) 99999-8888',
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto.' })
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Cidade e Estado',
    example: 'Recife - PE',
  })
  @IsOptional()
  @IsString({ message: 'A cidade deve ser um texto.' })
  cidade?: string;

  @ApiPropertyOptional({
    description: 'URL completa do perfil LinkedIn',
    example: 'https://www.linkedin.com/in/maria-oliveira-silva',
  })
  @IsOptional()
  @IsUrl({}, { message: 'A URL do LinkedIn deve ser um link válido (ex: https://...)' })
  linkedinUrl?: string;
}