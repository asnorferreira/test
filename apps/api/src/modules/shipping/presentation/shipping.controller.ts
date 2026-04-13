import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { ShippingService } from "../application/use-cases/shipping.service";
import { QuoteShippingDto } from "../application/dtos/quote-shipping.dto";

@ApiTags("Shipping")
@Controller("shipping")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post("quote")
  @ApiOperation({
    summary: "Calcular frete por CEP (retorna endereço e opções)",
  })
  async quote(@Body() dto: QuoteShippingDto) {
    return this.shippingService.quote(dto.zipCode);
  }
}
