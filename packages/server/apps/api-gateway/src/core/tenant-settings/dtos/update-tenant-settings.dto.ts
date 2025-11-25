import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional({
    description: 'ID do tenant a ser atualizado (apenas para administradores globais).',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Habilita ou desabilita o widget para o tenant.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  widgetEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Provedor de IA padrao para o tenant (ex: openai).',
    example: 'openai',
  })
  @IsString()
  @IsOptional()
  defaultAiProvider?: string;

  @ApiPropertyOptional({
    description: 'Modelo de IA padrao para o tenant.',
    example: 'gpt-4.1-mini',
  })
  @IsString()
  @IsOptional()
  defaultAiModel?: string;
}
