import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({
    example: 'Campanha de Cobranca 1',
    description: 'Nome da campanha.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'ID do tenant ao qual a campanha pertence.',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({
    description: 'Define se a IA (coach) deve ser ativada para esta campanha.',
    default: false,
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
