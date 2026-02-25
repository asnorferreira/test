import { Controller, Get, Patch, Param, Body, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { MedicalCaseService } from "../application/use-cases/medical-case.service";
import { ReviewCaseDto } from "../application/dtos/review-case.dto";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { UserRole } from "@maemais/shared-types";
import { CurrentUser } from "@/core/decorators/current-user.decorator";

@ApiTags("Medical Cases")
@Controller("medical-cases")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MedicalCasesController {
  constructor(private readonly service: MedicalCaseService) {}

  @Get("pending")
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Obter fila de casos médicos pendentes" })
  @ApiResponse({ status: 200, description: "Fila retornada (FIFO)" })
  async getPendingQueue() {
    return this.service.getPendingQueue();
  }

  @Patch(":id/review")
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: "Avaliar um caso médico (Aprovar/Recusar)" })
  @ApiResponse({ status: 200, description: "Caso revisado com sucesso" })
  async reviewCase(
    @Param("id") id: string,
    @Body() dto: ReviewCaseDto,
    @CurrentUser() user: any,
  ) {
    return this.service.reviewCase(id, user.id, dto);
  }
}
