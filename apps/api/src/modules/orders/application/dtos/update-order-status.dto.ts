import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "@maemais/shared-types";

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status!: OrderStatus;

  @ApiPropertyOptional({
    description: "Código de rastreio (caso status seja SHIPPED)",
  })
  @IsString()
  @IsOptional()
  trackingCode?: string;
}
