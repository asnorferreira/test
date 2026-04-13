import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { PharmacyService } from "../application/use-cases/pharmacy.service";

@ApiTags("Pharmacies")
@Controller("pharmacies")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PharmaciesController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  @ApiOperation({ summary: "Listar farmácias parceiras próximas (mock)" })
  async findNearby(@Query("zipCode") zipCode?: string) {
    return this.pharmacyService.findNearby(zipCode);
  }
}
