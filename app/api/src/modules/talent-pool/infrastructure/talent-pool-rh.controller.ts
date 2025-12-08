import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  StreamableFile,
  UseGuards,
  Res,
  Post,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Roles } from "@/modules/iam/infrastructure/authentication/decorators/roles.decorator";
import { UserRole } from "@jsp/shared";
import { RolesGuard } from "@/modules/iam/infrastructure/authentication/guards/roles.guard";
import { GetTalentPoolUseCase } from "../application/use-cases/get-talent-pool.use-case";
import { GetSubmissionDetailsUseCase } from "../application/use-cases/get-submission-details.use-case";
import { UpdateSubmissionStatusUseCase } from "../application/use-cases/update-submission-status.use-case";
import { GetTalentPoolQueryDto } from "../presentation/dtos/get-talent-pool-query.dto";
import { UpdateStatusDto } from "../presentation/dtos/update-status.dto";
import { PaginationResponse } from "../application/ports/i-talent-pool.repository";
import { ExportTalentDto } from "../presentation/dtos/export-talent.dto";
import { ExportSubmissionsUseCase } from "../application/use-cases/export-submissions.use-case";
import { TalentSubmissionFullResponse } from "../presentation/responses/talent-submission-full.response";
import { Readable } from "stream";
import type { Response } from "express";
import { TalentPoolSubmission } from "@prisma/client";
import { SendOpportunitiesDto } from "../presentation/dtos/send-opportunities.dto";
import { SendOpportunitiesUseCase } from "../application/use-cases/send-opportunities.use-case";

@ApiTags("3. Talent Pool (RH)")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.RH, UserRole.GESTOR, UserRole.ADMIN)
@Controller("rh/talent-pool")
export class TalentPoolRhController {
  constructor(
    @Inject(GetTalentPoolUseCase)
    private readonly getTalentPoolUseCase: GetTalentPoolUseCase,
    @Inject(GetSubmissionDetailsUseCase)
    private readonly getSubmissionDetailsUseCase: GetSubmissionDetailsUseCase,
    @Inject(UpdateSubmissionStatusUseCase)
    private readonly updateSubmissionStatusUseCase: UpdateSubmissionStatusUseCase,
    @Inject(ExportSubmissionsUseCase)
    private readonly exportSubmissionsUseCase: ExportSubmissionsUseCase,
    @Inject(SendOpportunitiesUseCase)
    private readonly sendOpportunitiesUseCase: SendOpportunitiesUseCase
  ) {}

  @Get()
  @ApiOperation({
    summary: "Visualizar banco de talentos (Painel RH) (Fluxo 7)",
    description:
      "Lista, filtra e pagina todas as submissões do banco de talentos.",
  })
  @ApiOkResponse({ description: "Lista paginada de submissões." })
  @ApiUnauthorizedResponse({ description: "Acesso negado (Token inválido)." })
  @ApiForbiddenResponse({ description: "Acesso negado (Papel inválido)." })
  async getTalentPool(
    @Query() query: GetTalentPoolQueryDto
  ): Promise<PaginationResponse<TalentPoolSubmission>> {
    return this.getTalentPoolUseCase.execute(query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Visualiza detalhes de uma submissão (Fluxo 8)",
  })
  @ApiOkResponse({
    description: "Detalhes da submissão.",
    type: TalentSubmissionFullResponse,
  })
  @ApiNotFoundResponse({ description: "Submissão não encontrada." })
  @ApiUnauthorizedResponse({ description: "Acesso negado." })
  async getSubmissionDetails(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<TalentPoolSubmission> {
    return this.getSubmissionDetailsUseCase.execute(id);
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Atualiza o status de uma submissão (Fluxo 9)",
  })
  @ApiOkResponse({ description: "Status atualizado com sucesso." })
  @ApiNotFoundResponse({ description: "Submissão não encontrada." })
  @ApiBadRequestResponse({ description: "Status inválido." })
  @ApiUnauthorizedResponse({ description: "Acesso negado." })
  async updateSubmissionStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto
  ): Promise<{ message: string }> {
    return this.updateSubmissionStatusUseCase.execute(id, dto);
  }

  @Post("export")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Exporta submissões em CSV ou ZIP (Fluxo 10)",
  })
  @ApiOkResponse({
    description: "Inicia o download do arquivo (CSV ou ZIP).",
  })
  async exportSubmissions(
    @Body() dto: ExportTalentDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    try {
      const { stream, filename, contentType } =
        await this.exportSubmissionsUseCase.execute(dto);

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      if (!(stream instanceof Readable)) {
        throw new InternalServerErrorException(
          "O stream de exportação gerado não é um Readable."
        );
      }

      return new StreamableFile(stream as any);
    } catch (error) {
      console.error("Falha na exportação:", error);
      if (
        error instanceof InternalServerErrorException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erro ao gerar o arquivo de exportação."
      );
    }
  }

  @Post("send-opportunities")
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({
    summary:
      "Dispara e-mail de oportunidades de vagas para candidatos selecionados.",
  })
  @ApiOkResponse({ description: "E-mails disparados com sucesso." })
  async sendOpportunities(@Body() dto: SendOpportunitiesDto) {
    const result = await this.sendOpportunitiesUseCase.execute(dto);
    return {
      message: `E-mails de oportunidade disparados para ${result.count} candidatos.`,
      count: result.count,
    };
  }
}
