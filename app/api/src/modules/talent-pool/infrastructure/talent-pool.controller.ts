import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '@/modules/iam/infrastructure/authentication/decorators/roles.decorator';
import { UserRole } from '@jsp/shared';
import { RolesGuard } from '@/modules/iam/infrastructure/authentication/guards/roles.guard';
import { ActiveUser } from '@/modules/iam/infrastructure/authentication/decorators/active-user.decorator';
import { SubmitToTalentPoolUseCase } from '../application/use-cases/submit-to-talent-pool.use-case';
import { GetMySubmissionsUseCase } from '../application/use-cases/get-my-submissions.use-case';
import { SubmitTalentDto } from '../presentation/dtos/submit-talent.dto';
import { MySubmissionResponse } from '../presentation/responses/my-submission.response';
import {
  cvFileFilter,
  cvFileFilterRegex,
  cvFileLimits,
} from './file-upload.utils';
import type { FileUpload } from '@/core/storage/i-storage.service';

@ApiTags('2. Talent Pool (Candidato)')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.CANDIDATE)
@Controller('talent-pool')
export class TalentPoolController {
  constructor(
    @Inject(SubmitToTalentPoolUseCase)
    private readonly submitToTalentPoolUseCase: SubmitToTalentPoolUseCase,
    @Inject(GetMySubmissionsUseCase)
    private readonly getMySubmissionsUseCase: GetMySubmissionsUseCase,
  ) {}

  @Post('submit')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: cvFileLimits,
      fileFilter: cvFileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Candidato envia currículo para o Banco de Talentos (Fluxo 5)',
  })
  @ApiBody({
    description:
      'DTO com os dados do formulário e o arquivo do currículo (file).',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo do currículo (PDF, DOC, DOCX - Max 5MB)',
        },
        areaDesejada: { type: 'string' },
        tipoContrato: { type: 'string' },
        modalidade: { type: 'string' },
        disponibilidade: { type: 'string' },
        descricaoVaga: { type: 'string', nullable: true },
      },
      required: [
        'file',
        'areaDesejada',
        'tipoContrato',
        'modalidade',
        'disponibilidade',
      ],
    },
  })
  @ApiCreatedResponse({ description: 'Currículo enviado com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou arquivo faltando.' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado (não é candidato).' })
  async submitToTalentPool(
    @Body() dto: SubmitTalentDto,
    @ActiveUser('sub') candidateId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: cvFileLimits.fileSize }),
          new FileTypeValidator({ fileType: cvFileFilterRegex }),
        ],
      }),
    )
    file: FileUpload,
  ) {
    if (!file) throw new BadRequestException('Arquivo é obrigatório.');

    return this.submitToTalentPoolUseCase.execute(dto, candidateId, file);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Candidato visualiza suas submissões (Fluxo 6)',
  })
  @ApiOkResponse({
    description: 'Lista de submissões do candidato.',
    type: [MySubmissionResponse],
  })
  @ApiUnauthorizedResponse({ description: 'Acesso negado (não é candidato).' })
  async getMySubmissions(
    @ActiveUser('sub') candidateId: string,
  ): Promise<Partial<MySubmissionResponse>[]> {
    return this.getMySubmissionsUseCase.execute(candidateId);
  }
}