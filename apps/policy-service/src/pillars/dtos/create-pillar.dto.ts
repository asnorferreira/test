import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePillarDto {
  @ApiProperty({
    description: 'ID da campanha à qual o pilar pertence.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty({ message: 'O ID da campanha é obrigatório.' })
  campaignId: string;

  @ApiProperty({
    description: 'Nome do pilar de avaliação (ex: "Apresentação", "Negociação").',
    example: 'Apresentação',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do pilar é obrigatório.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do que este pilar avalia.',
    example: 'Avalia a qualidade da saudação inicial do atendente.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Peso do pilar na avaliação final (1 a 10).',
    example: 5,
    minimum: 1,
    maximum: 10,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'O peso deve ser no mínimo 1.' })
  @Max(10, { message: 'O peso deve ser no máximo 10.' })
  weight?: number;
}