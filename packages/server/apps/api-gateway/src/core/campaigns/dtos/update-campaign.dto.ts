import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCampaignDto {
  @ApiPropertyOptional({
    example: 'Campanha de Cobranca (Atualizada)',
    description: 'Novo nome da campanha.',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Altera o status de ativacao da IA para a campanha.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  aiEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Fornecedor de IA a ser utilizado (ex: openai).',
    example: 'openai',
  })
  @IsString()
  @IsOptional()
  aiProvider?: string;

  @ApiPropertyOptional({
    description: 'Modelo de IA preferencial para sugestoes.',
    example: 'gpt-4.1-mini',
  })
  @IsString()
  @IsOptional()
  aiModel?: string;
}
