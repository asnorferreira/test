import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { QuestionnaireService } from "../application/use-cases/questionnaire.service";
import { SubmitQuestionnaireDto } from "../application/dtos/submit-questionnaire.dto";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { CurrentUser } from "@/core/decorators/current-user.decorator";

@ApiTags("Questionnaires")
@Controller("questionnaires")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionnairesController {
  constructor(private readonly service: QuestionnaireService) {}

  @Post()
  @ApiOperation({ summary: "Submeter questionário de anamnese" })
  @ApiResponse({
    status: 201,
    description: "Questionário avaliado e salvo com sucesso",
  })
  async submit(@CurrentUser() user: any, @Body() dto: SubmitQuestionnaireDto) {
    return this.service.submit(user.id, dto);
  }

  @Get("history")
  @ApiOperation({ summary: "Ver histórico de questionários do usuário logado" })
  @ApiResponse({ status: 200, description: "Retorna a lista de questionários" })
  async getHistory(@CurrentUser() user: any) {
    return this.service.getUserHistory(user.id);
  }
}
