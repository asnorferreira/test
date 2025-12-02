import {
  Body,
  Controller,
  FileTypeValidator,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@/modules/iam/infrastructure/authentication/decorators/public.decorator';
import { PublicJobApplicationDto } from '../presentation/dtos/public-job-application.dto';
import { PublicJobApplicationUseCase } from '../application/use-cases/public-job-application.use-case';
import {
  cvFileFilter,
  cvFileFilterRegex,
  cvFileLimits,
} from './file-upload.utils';
import type { FileUpload } from '@/core/storage/i-storage.service';

@ApiTags('2. Talent Pool (Público/Candidatura)')
@Controller('talent-pool')
export class PublicTalentPoolController {
  constructor(
    @Inject(PublicJobApplicationUseCase)
    private readonly publicJobApplicationUseCase: PublicJobApplicationUseCase,
  ) {}

  @Public()
  @Post('public-submit')
  @UseInterceptors(FileInterceptor('resumeFile', {
    limits: cvFileLimits,
    fileFilter: cvFileFilter,
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Candidatura Unificada (Cadastro + Upload)',
    description: 'Cria usuário, perfil e envia currículo em uma única requisição.'
  })
  @ApiBody({ type: PublicJobApplicationDto })
  @ApiCreatedResponse({ description: 'Candidatura enviada com sucesso.' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado.' })
  async publicSubmit(
    @Body() dto: PublicJobApplicationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: cvFileLimits.fileSize }),
          new FileTypeValidator({ fileType: cvFileFilterRegex }),
        ],
        fileIsRequired: true,
      }),
    )
    file: FileUpload,
  ) {
    if (!file) throw new BadRequestException('O arquivo do currículo é obrigatório.');
    return this.publicJobApplicationUseCase.execute(dto, file);
  }
}