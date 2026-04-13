import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  Min,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";

class OrderItemDto {
  @ApiProperty({ example: "uuid-do-produto" })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class ShippingAddressDto {
  @ApiProperty({ example: "01310100" })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/)
  zipCode!: string;

  @ApiProperty() @IsString() @IsNotEmpty() street!: string;
  @ApiProperty() @IsString() @IsNotEmpty() number!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() complement?: string;
  @ApiProperty() @IsString() @IsNotEmpty() neighborhood!: string;
  @ApiProperty() @IsString() @IsNotEmpty() city!: string;
  @ApiProperty() @IsString() @IsNotEmpty() state!: string;
  @ApiProperty() @IsString() @IsNotEmpty() recipient!: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone!: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: "uuid-da-prescricao",
    description: "Obrigatório para itens que exigem receita",
  })
  @IsString()
  @IsOptional()
  prescriptionId?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress!: ShippingAddressDto;

  @ApiProperty({
    example: 1990,
    description: "Valor do frete em centavos (obtido via /shipping/quote)",
  })
  @IsNumber()
  @Min(0)
  shippingFeeCents!: number;

  @ApiPropertyOptional({ example: "farm-001" })
  @IsString()
  @IsOptional()
  partnerPharmacyId?: string;
}
