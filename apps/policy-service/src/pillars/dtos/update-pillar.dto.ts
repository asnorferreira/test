import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePillarDto {
  @ApiPropertyOptional({
    description: 'Novo nome do pilar.',
    example: 'Saudação e Apresentação',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome do pilar não pode ser vazio.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Nova descrição do pilar.',
    example: 'Avalia a saudação e a confirmação dos dados do titular.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Novo peso do pilar na avaliação (1 a 10).',
    example: 7,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'O peso deve ser no mínimo 1.' })
  @Max(10, { message: 'O peso deve ser no máximo 10.' })
  weight?: number;
}