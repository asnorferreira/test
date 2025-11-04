import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OidcAuthGuard } from '@infrastructure/security/oidc-auth.guard';
import { RolesGuard } from '@infrastructure/security/roles.guard';
import { Roles } from '@infrastructure/security/roles.decorator';
import { PerfilOperador } from '@prisma/client';
import { ComandoAbrirDTO, ValidarAcessoDTO } from '@app/domain';
import { AcionamentoManualUseCase } from '@application/use-cases/acesso/acionamento-manual.usecase';
// (Importar ValidarAcessoOnlineUseCase)
import { JwtPayload } from '@infrastructure/security/jwt.payload.interface';
import { AuthUser } from '@infrastructure/security/auth-user.decorator';

@ApiTags('Portaria API (Operação)')
@ApiBearerAuth('OIDC-Auth')
@UseGuards(OidcAuthGuard, RolesGuard)
@Roles(PerfilOperador.PORTARIA, PerfilOperador.SINDICO, PerfilOperador.ADMIN_TI)
@Controller('/v1/portaria')
export class PortariaController {
  constructor(
     private readonly acionamentoManualUseCase: AcionamentoManualUseCase,
     // private readonly validarAcessoOnlineUseCase: ValidarAcessoOnlineUseCase,
  ) {}

  /**
   * Endpoint de fallback para validação (se o Edge estiver offline)
   */
  @Post('acessos/validar')
  @ApiOperation({ summary: 'Validação de acesso (Fallback Online)' })
  async validarAcesso(@Body() data: ValidarAcessoDTO) {
    // return this.validarAcessoOnlineUseCase.execute(data);
  }

  /**
   * Endpoint principal para acionamento manual (Fase 9.4)
   */
  @Post('acessos/acionar')
  @ApiOperation({ summary: 'Acionamento manual (com auditoria)' })
  async acionarManual(
    @Body() data: ComandoAbrirDTO,
    @AuthUser() user: JwtPayload
  ) {
    // (Reutiliza o mesmo UseCase do AdminController)
    return this.acionamentoManualUseCase.execute(data, user);
  }

  @Get('turno/dashboard')
  @ApiOperation({ summary: 'Eventos recentes e status (Dashboard da Portaria)' })
  async getDashboardTurno() {
    // (Este endpoint buscará no Relatórios (Fase 13))
    // return this.relatorioService.getEventosRecentes();
  }
}