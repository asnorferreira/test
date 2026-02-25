import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PayOrderDto {
  @ApiProperty({ example: "CREDIT_CARD", enum: ["CREDIT_CARD", "PIX"] })
  @IsEnum(["CREDIT_CARD", "PIX"])
  @IsNotEmpty()
  paymentMethod!: "CREDIT_CARD" | "PIX";

  @ApiProperty({ description: "Token do cartão gerado no frontend" })
  @IsString()
  @IsOptional()
  cardToken?: string;
}
