import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class ExportFiltersDto {
  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: SubmissionStatus,
  })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;
}

export class ExportTalentDto {
  @ApiPropertyOptional({
    description: 'Lista de UUIDs das submissões para exportar.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  submissionIds?: string[];

  @ApiPropertyOptional({
    description:
      'Filtros a serem aplicados (usado se submissionIds não for fornecido)',
    type: ExportFiltersDto,
  })
  @IsOptional()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ExportFiltersDto)
  @ValidateIf((o) => !o.submissionIds || o.submissionIds.length === 0)
  filters?: ExportFiltersDto;

  @ApiProperty({
    description: 'Incluir arquivo CSV/XLSX com os dados.',
    example: true,
  })
  @IsBoolean()
  includeData!: boolean;

  @ApiProperty({
    description: 'Incluir os arquivos PDF dos currículos (gera um ZIP).',
    example: false,
  })
  @IsBoolean()
  includePdfs!: boolean;
}