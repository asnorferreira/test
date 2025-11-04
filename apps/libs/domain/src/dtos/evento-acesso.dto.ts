import { ApiProperty } from '@nestjs/swagger';
import { AcaoEvento, ResultadoEvento } from '@prisma/client';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class EventoDeAcessoDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pessoaId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  credencialId?: string;

  @ApiProperty()
  @IsString()
  pontoId: string;

  @ApiProperty({ enum: AcaoEvento })
  @IsEnum(AcaoEvento)
  acao: AcaoEvento;

  @ApiProperty({ enum: ResultadoEvento })
  @IsEnum(ResultadoEvento)
  resultado: ResultadoEvento;

  @ApiProperty()
  @IsDateString()
  dataHora: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  snapshotUri?: string;

  @ApiPropertyOptional()
  @IsOptional()
  meta?: Record<string, any>;
}