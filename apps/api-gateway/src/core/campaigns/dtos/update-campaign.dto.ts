import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCampaignDto {
  @ApiPropertyOptional({
    example: 'Campanha de Cobrança (Atualizada)',
    description: 'Novo nome da campanha.',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
