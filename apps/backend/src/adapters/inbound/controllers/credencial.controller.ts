import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { OidcAuthGuard } from '@infrastructure/security/oidc-auth.guard';
import { RolesGuard } from '@infrastructure/security/roles.guard';
import { Roles } from '@infrastructure/security/roles.decorator';
import { PerfilOperador } from '@prisma/client';
import {
  GenerateQrCodeDTO,
  QrCodeResponseDTO,
} from '@application/dtos/credencial.dto';
import { GenerateTempQrUseCase } from '@application/use-cases/credencial/generate-temp-qr/generate-temp-qr.usecase';
import { CadastrarFacialDTO } from '@application/use-cases/credencial/cadastrar-facial/cadastrar-facial.dto';
import { CadastrarFacialUseCase } from '@application/use-cases/credencial/cadastrar-facial/cadastrar-facial.usecase';
import { CredencialResponseDTO } from '@application/dtos/credencial.dto';

@ApiTags('Admin: Credenciais')
@ApiBearerAuth('OIDC-Auth')
@UseGuards(OidcAuthGuard, RolesGuard)
@Controller('/v1/credenciais')
export class CredencialController {
  constructor(
    private readonly generateTempQrUseCase: GenerateTempQrUseCase,
    private readonly cadastrarFacialUseCase: CadastrarFacialUseCase, // (Novo)
  ) {}

  // TODO: POST /v1/pessoas: (Implementado) Cria Pessoa.
  // TODO: GET /v1/pessoas: (Implementado) Lista Pessoas.
  // TODO: GET /v1/pessoas/:id: (Implementado) Busca Pessoa.
  // TODO: PUT /v1/pessoas/:id: (Implementado) Atualiza Pessoa.
  // TODO: DELETE /v1/pessoas/:id: (A ser implementado) Remove Pessoa.
  // TODO: Proteção: OidcAuthGuard, RolesGuard (ADMIN_TI, SINDICO).

  @Post('qr-code/generate')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO, PerfilOperador.PORTARIA)
  @ApiOperation({ summary: 'Gerar um QR Code temporário para uma pessoa' })
  @ApiCreatedResponse({ type: QrCodeResponseDTO })
  async generateQrCode(
    @Body() data: GenerateQrCodeDTO,
  ): Promise<QrCodeResponseDTO> {
    return this.generateTempQrUseCase.execute(data);
  }

  // TODO: POST /:pessoaId/uhf (Fase 8.3)
  // TODO: POST /:pessoaId/facial (Fase 10)
  @Post('facial/cadastrar')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO)
  @ApiOperation({ summary: 'Cadastra uma nova credencial facial (orquestrado)' })
  @ApiCreatedResponse({ type: CredencialResponseDTO })
  async cadastrarFacial(
    @Body() data: CadastrarFacialDTO,
  ): Promise<CredencialResponseDTO> {
    return this.cadastrarFacialUseCase.execute(data);
  }
}