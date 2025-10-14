import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScriptDto {
  @ApiProperty({
    description: 'ID da campanha à qual o script pertence.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @ApiProperty({
    description: 'Categoria do script (ex: "Abertura", "Objeção de Valor").',
    example: 'Abertura',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'O conteúdo do script.',
    example: 'Olá, [CLIENTE], tudo bem? Meu nome é [ATENDENTE]...',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Define se o script está ativo para ser sugerido.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}