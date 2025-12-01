import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterCandidateDto } from '../presentation/dtos/register-candidate.dto';
import { LoginDto } from '../presentation/dtos/login.dto';
import { RegisterCandidateUseCase } from '../application/use-cases/register-candidate.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { Public } from './authentication/decorators/public.decorator';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoginSuccessResponse } from '../presentation/responses/login-success.response';
import { Roles } from './authentication/decorators/roles.decorator';
import { UserRole } from '@jsp/shared';
import { RolesGuard } from './authentication/guards/roles.guard';
import { CreateStaffUserUseCase } from '../application/use-cases/create-staff-user.use-case';
import { CreateStaffUserDto } from '../presentation/dtos/create-staff-user.dto';
import { User } from '@prisma/client';
import { ActiveUser } from './authentication/decorators/active-user.decorator';
import type { ActiveUserData } from './authentication/strategies/jwt.strategy';

@ApiTags('1. IAM (Autenticação e Usuários)')
@Controller('auth')
export class IamController {
  constructor(
    @Inject(RegisterCandidateUseCase)
    private readonly registerCandidateUseCase: RegisterCandidateUseCase,
    @Inject(LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
    @Inject(CreateStaffUserUseCase)
    private readonly createStaffUserUseCase: CreateStaffUserUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registro de novo candidato (Fluxo 1)',
    description:
      'Endpoint público para um novo candidato criar sua conta. A conta é criada como inativa e um e-mail de verificação é disparado (logicamente).',
  })
  @ApiCreatedResponse({ description: 'Cadastro realizado com sucesso.' })
  @ApiConflictResponse({ description: 'Este e-mail já está em uso.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos (DTO Validation).' })
  async registerCandidate(@Body() dto: RegisterCandidateDto) {
    return this.registerCandidateUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuário (Candidato, RH, Gestor, Admin) (Fluxo 2)',
    description:
      'Autentica um usuário e retorna um Access Token (no body) e um Refresh Token (em um cookie HttpOnly).',
  })
  @ApiOkResponse({
    description: 'Login bem-sucedido.',
    type: LoginSuccessResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.loginUseCase.execute(dto);

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: '/',
    });

    return { accessToken };
  }

  @Post('users/staff')
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criação de usuários Staff (RH ou GESTOR) (Fluxo 2.4)',
    description:
      'Endpoint protegido para ADMIN ou GESTOR criarem novos usuários. GESTORES só podem criar RH.',
  })
  @ApiCreatedResponse({ description: 'Usuário staff criado com sucesso.' })
  @ApiForbiddenResponse({
    description: 'Acesso negado (ex: GESTOR tentando criar ADMIN).',
  })
  @ApiConflictResponse({ description: 'Este e-mail já está em uso.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT inválido ou ausente.' })
  async createStaffUser(
    @Body() dto: CreateStaffUserDto,
    @ActiveUser() actor: ActiveUserData,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.createStaffUserUseCase.execute(dto, actor);
    return user;
  }
}