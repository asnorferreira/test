import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuggestionType } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ChecklistItemStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class ChecklistItemDto {
  @ApiProperty({ example: 'Apresentação Inicial', description: 'Nome do pilar/item do checklist.' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ChecklistItemStatus, example: ChecklistItemStatus.COMPLETED })
  @IsEnum(ChecklistItemStatus)
  status: ChecklistItemStatus;

  @ApiPropertyOptional({ description: 'Detalhes ou motivo da falha/sucesso.' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SuggestionDto {
  @ApiProperty({ description: 'Conteúdo da sugestão ou script.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Tipo de sugestão (SCRIPT, ACTION, ALERT).', enum: SuggestionType })
  @IsEnum(SuggestionType)
  type: SuggestionType;
}

export class AnalyzeResponseDto {
  @ApiProperty({ description: 'ID único da análise.' })
  @IsString()
  analysisId: string;

  @ApiProperty({ type: [ChecklistItemDto], description: 'Status atualizado do checklist.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist: ChecklistItemDto[];

  @ApiProperty({ type: [SuggestionDto], description: 'Sugestões e alertas da IA.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestionDto)
  suggestions: SuggestionDto[];

  @ApiPropertyOptional({ description: 'Qualquer alerta crítico.' })
  @IsOptional()
  alert?: string;
}