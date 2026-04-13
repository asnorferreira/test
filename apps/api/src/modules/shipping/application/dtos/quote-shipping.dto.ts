import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class QuoteShippingDto {
  @ApiProperty({ example: "01310100" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, { message: "CEP deve ter 8 dígitos." })
  zipCode!: string;
}
