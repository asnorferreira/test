// apps/backend/src/4-adapters/inbound/controllers/dispositivo.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OidcAuthGuard } from '@infrastructure/security/oidc-auth.guard';
import { RolesGuard } from '@infrastructure/security/roles.guard';
import { Roles } from '@infrastructure/security/roles.decorator';
import { PerfilOperador } from '@prisma/client';
import { ComandoAbrirDTO } from '@app/domain'; // Lib
import { AcionamentoManualUseCase } from '@application/use-cases/acesso/acionamento-manual.usecase';
import { JwtPayload } from '@infrastructure/security/jwt.payload.interface';
import { AuthUser } from '@infrastructure/security/auth-user.decorator';

@ApiTags('Admin: Dispositivos e Pontos de Acesso')
@ApiBearerAuth('OIDC-Auth')
@UseGuards(OidcAuthGuard, RolesGuard)
@Controller()
export class DispositivoController {
  constructor(
     // (Injetar UseCases de CRUD de Dispositivo/PontoAcesso)
     private readonly acionamentoManualUseCase: AcionamentoManualUseCase,
  ) {}

    // TODO: POST /v1/licencas/ativar: (Implementado) Ativa a licença da instalação.
    // TODO: GET /v1/licencas/status/:instalacaoId: (Implementado) Verifica o status.
    // TODO: Proteção: OidcAuthGuard, RolesGuard (ADMIN_TI, INTEGRADOR).
 
  @Get('/v1/dispositivos')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.INTEGRADOR)
  @ApiOperation({ summary: 'Listar todos os dispositivos (hardware)' })
  async getDispositivos() {
    // return this.findDispositivosUseCase.execute();
  }
  
  @Post('/v1/dispositivos')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.INTEGRADOR)
  @ApiOperation({ summary: 'Cadastrar novo dispositivo' })
  async createDispositivo(@Body() data: any /* CreateDispositivoDTO */) {
    // return this.createDispositivoUseCase.execute(data);
  }

  @Get('/v1/pontos-acesso')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.INTEGRADOR)
  @ApiOperation({ summary: 'Listar todos os pontos de acesso (lógicos)' })
  async getPontosAcesso() {
     // return this.findPontosAcessoUseCase.execute();
  }
  
  @Post('/v1/pontos-acesso')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.INTEGRADOR)
  @ApiOperation({ summary: 'Cadastrar novo ponto de acesso' })
  async createPontoAcesso(@Body() data: any /* CreatePontoAcessoDTO */) {
    // return this.createPontoAcessoUseCase.execute(data);
  }

  /**
   * Este endpoint permite ao Admin/Portaria acionar um ponto
   * (Diferente da API de Portaria, este é o endpoint de Admin)
   * (Ref: Fase 9.4)
   */
  @Post('/v1/pontos-acesso/acionar')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO, PerfilOperador.PORTARIA)
  @ApiOperation({ summary: 'Acionamento manual (com auditoria)' })
  async acionarManual(
    @Body() data: ComandoAbrirDTO,
    @AuthUser() user: JwtPayload
  ) {
    return this.acionamentoManualUseCase.execute(data, user);
  }
}