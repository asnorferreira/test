import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@jsp/shared';
import { GetCandidateProfileUseCase } from '../application/use-cases/get-candidate-profile.use-case';
import { UpdateCandidateProfileUseCase } from '../application/use-cases/update-candidate-profile.use-case';
import { CandidateProfileResponse } from '../presentation/responses/candidate-profile.response';
import { UpdateProfileDto } from '../presentation/dtos/update-profile.dto';
import { RolesGuard } from '@/modules/iam/infrastructure/authentication/guards/roles.guard';
import { Roles } from '@/modules/iam/infrastructure/authentication/decorators/roles.decorator';
import { ActiveUser } from '@/modules/iam/infrastructure/authentication/decorators/active-user.decorator';

@ApiTags('2. Perfis (Candidato)')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.CANDIDATE) 
@Controller('profiles')
export class ProfilesController {
  constructor(
    @Inject(GetCandidateProfileUseCase)
    private readonly getCandidateProfileUseCase: GetCandidateProfileUseCase,
    @Inject(UpdateCandidateProfileUseCase)
    private readonly updateCandidateProfileUseCase: UpdateCandidateProfileUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Buscar perfil base do candidato logado (Fluxo 3)',
    description:
      'Busca o perfil de dados (Passo 2) associado ao token JWT do candidato.',
  })
  @ApiOkResponse({
    description: 'Perfil do candidato retornado com sucesso.',
    type: CandidateProfileResponse,
  })
  @ApiNotFoundResponse({
    description: 'Perfil não encontrado (candidato ainda não preencheu o Passo 2).',
  })
  @ApiUnauthorizedResponse({ description: 'Acesso negado (não é um candidato).' })
  async getMyProfile(
    @ActiveUser('sub') userId: string,
  ): Promise<CandidateProfileResponse> {
    return this.getCandidateProfileUseCase.execute(userId);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Atualizar/criar perfil base do candidato logado (Fluxo 4)',
    description:
      'Cria ou atualiza (upsert) o perfil de dados (Passo 2) do candidato logado.',
  })
  @ApiOkResponse({
    description: 'Perfil do candidato atualizado com sucesso.',
    type: CandidateProfileResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Acesso negado (não é um candidato).' })
  async updateMyProfile(
    @ActiveUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<CandidateProfileResponse> {
    return this.updateCandidateProfileUseCase.execute(userId, dto);
  }
}