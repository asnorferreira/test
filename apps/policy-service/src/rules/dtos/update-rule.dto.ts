import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateNegotiationRuleDto {
  @ApiPropertyOptional({
    description: 'Novo percentual máximo de desconto permitido.',
    example: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  maxDiscountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Novo número máximo de parcelas permitido.',
    example: 18,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstallments?: number;

  @ApiPropertyOptional({
    description: 'Novo valor mínimo de entrada exigido.',
    example: 500,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minDownPayment?: number;

  @ApiPropertyOptional({
    description: 'Nova lista de termos proibidos.',
    example: ['desconto extra'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forbiddenTerms?: string[];
}