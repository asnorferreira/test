import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class PayOrderDto {
  @ApiProperty({ example: "CREDIT_CARD", enum: ["CREDIT_CARD", "PIX"] })
  @IsEnum(["CREDIT_CARD", "PIX"])
  @IsNotEmpty()
  paymentMethod!: "CREDIT_CARD" | "PIX";

  @ApiPropertyOptional({
    description: "Token do cartão gerado no frontend via Pagar.me JS",
  })
  @IsString()
  @IsOptional()
  cardToken?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  installments?: number;

  @ApiPropertyOptional({ example: "12345678900", description: "CPF do cliente" })
  @IsString()
  @IsOptional()
  customerDocument?: string;
}
