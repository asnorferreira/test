import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty({
    example: "Fórmula MãeMais",
    description: "Nome do produto de venda direta",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: "Suplemento natural para lactantes..." })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 189.9,
    description: "Preço base do produto (ex: R$ 189,90)",
  })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
