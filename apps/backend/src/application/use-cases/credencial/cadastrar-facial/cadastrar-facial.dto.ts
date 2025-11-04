import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CadastrarFacialDTO {
  @ApiProperty({ description: 'ID da Pessoa' })
  @IsString()
  @IsNotEmpty()
  pessoaId: string;

  @ApiProperty({ description: 'Imagem (Base64) capturada para cadastro' })
  @IsString()
  @IsNotEmpty()
  imagemBase64: string;
  
  @ApiPropertyOptional({ 
    description: 'IDs dos Pontos de Acesso onde esta face será usada. (Se vazio, usa todos)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pontoAcessoIds?: string[];
}