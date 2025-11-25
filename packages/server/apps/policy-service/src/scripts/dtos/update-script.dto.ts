import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateScriptDto {
  @ApiPropertyOptional({
    description: 'Nova categoria do script.',
    example: 'Fechamento',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Novo conteúdo do script.',
    example: 'Agradecemos o seu contato!',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    description: 'Novo status de ativação do script.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}