import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateNegotiationRuleDto {
  @ApiProperty({
    description: 'ID da campanha à qual a regra se aplica.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiPropertyOptional({
    description: 'Percentual máximo de desconto permitido.',
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  maxDiscountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Número máximo de parcelas permitido.',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstallments?: number;

  @ApiPropertyOptional({
    description: 'Valor mínimo de entrada exigido (em centavos ou valor absoluto).',
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minDownPayment?: number;

  @ApiPropertyOptional({
    description: 'Lista de termos ou palavras proibidas na negociação.',
    example: ['grátis', 'sem juros'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forbiddenTerms?: string[];
}