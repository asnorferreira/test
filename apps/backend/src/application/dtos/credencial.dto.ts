import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TipoCredencial, StatusCredencial } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateCredencialDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pessoaId: string;

  @ApiProperty({ enum: TipoCredencial })
  @IsEnum(TipoCredencial)
  tipo: TipoCredencial;

  @ApiPropertyOptional({
    description: 'Valor da credencial (TAG UHF, Hash Facial, etc.)',
  })
  @IsString()
  @IsOptional()
  valor?: string;

  @ApiPropertyOptional({ enum: StatusCredencial })
  @IsEnum(StatusCredencial)
  @IsOptional()
  status?: StatusCredencial;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  vigenciaInicio?: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  vigenciaFim?: Date;
}

export class UpdateCredencialDTO extends PartialType(CreateCredencialDTO) {}

export class CredencialResponseDTO extends CreateCredencialDTO {
  @ApiProperty()
  id: string;
}

export class GenerateQrCodeDTO {
  @ApiProperty({ description: 'ID da Pessoa (Visitante/Morador)' })
  @IsString()
  pessoaId: string;

  @ApiProperty({ description: 'Tempo de expiração em minutos' })
  @IsOptional()
  expiracaoMinutos?: number;

  @ApiPropertyOptional({ description: 'Quais pontos de acesso este QR permite' })
  @IsString({ each: true })
  @IsOptional()
  pontoAcessoIds?: string[];
}

export class QrCodeResponseDTO {
  @ApiProperty()
  credencialId: string;

  @ApiProperty({ description: 'Hash (valor) do QR Code' })
  valor: string;

  @ApiProperty({ description: 'Payload (Base64) da imagem do QR Code' })
  qrCodeImageBase64: string;

  @ApiProperty()
  vigenciaFim: Date;
}