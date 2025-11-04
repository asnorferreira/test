import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ComandoAbrirDTO {
  @ApiProperty()
  @IsString()
  pontoId: string;

  @ApiPropertyOptional({
    description: 'Obrigatório para acionamento manual (Auditoria)',
  })
  @IsString()
  @IsOptional()
  justificativa?: string;
}