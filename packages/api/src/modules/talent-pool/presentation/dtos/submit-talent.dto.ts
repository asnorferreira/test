import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitTalentDto {
  @ApiProperty({ description: 'Passo 3: Área desejada', example: 'Administrativo' })
  @IsString() @IsNotEmpty()
  areaDesejada!: string;

  @ApiProperty({ description: 'Passo 3: Tipo de contrato', example: 'CLT' })
  @IsString() @IsNotEmpty()
  tipoContrato!: string;

  @ApiProperty({ description: 'Passo 3: Modalidade', example: 'Presencial' })
  @IsString() @IsNotEmpty()
  modalidade!: string;

  @ApiProperty({ description: 'Passo 3: Disponibilidade', example: 'Imediata' })
  @IsString() @IsNotEmpty()
  disponibilidade!: string;

  @ApiPropertyOptional({ description: 'Passo 3: Descrição da vaga (opcional)', example: 'Busco vaga de...' })
  @IsOptional()
  @IsString()
  descricaoVaga?: string;
}