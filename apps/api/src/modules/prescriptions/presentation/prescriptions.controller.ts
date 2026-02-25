import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrescriptionService } from "../application/use-cases/prescription.service";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { UserRole } from "@maemais/shared-types";
import { CurrentUser } from "@/core/decorators/current-user.decorator";

@ApiTags("Prescriptions")
@Controller("prescriptions")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrescriptionsController {
  constructor(private readonly service: PrescriptionService) {}

  @Get("my-prescriptions")
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: "Listar prescrições emitidas pelo médico" })
  async getMyPrescriptions(@CurrentUser() user: any) {
    return this.service.getMyPrescriptions(user.id);
  }

  @Patch(":id/cancel")
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: "Cancelar uma prescrição" })
  async cancelPrescription(@Param("id") id: string, @CurrentUser() user: any) {
    return this.service.cancelPrescription(id, user.id);
  }
}
