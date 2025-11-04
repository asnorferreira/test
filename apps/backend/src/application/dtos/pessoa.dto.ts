import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TipoPessoa } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContatosDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telefone?: string;
}

export class CreatePessoaDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ enum: TipoPessoa })
  @IsEnum(TipoPessoa)
  tipo: TipoPessoa;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documento?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observacao?: string;

  @ApiPropertyOptional({ type: ContatosDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContatosDTO)
  @IsObject()
  contatos?: ContatosDTO;
}

export class UpdatePessoaDTO extends PartialType(CreatePessoaDTO) {}

export class PessoaResponseDTO extends CreatePessoaDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;
}