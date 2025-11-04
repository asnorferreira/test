import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OidcAuthGuard } from '@infrastructure/security/oidc-auth.guard';
import { RolesGuard } from '@infrastructure/security/roles.guard';
import { Roles } from '@infrastructure/security/roles.decorator';
import { PerfilOperador } from '@prisma/client';
import { AtivarLicencaDTO, LicencaStatusDTO } from '@application/dtos/licenca.dto';
import { AtivarLicencaUseCase } from '@application/use-cases/licenca/ativar-licenca.usecase';
// (Importar GetLicencaStatusUseCase)

@ApiTags('Admin: Licenciamento')
@ApiBearerAuth('OIDC-Auth')
@UseGuards(OidcAuthGuard, RolesGuard)
@Controller('/v1/licencas')
export class LicencaController {
  constructor(
    private readonly ativarUseCase: AtivarLicencaUseCase,
    // private readonly statusUseCase: GetLicencaStatusUseCase,
  ) {}

  @Post('ativar')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.INTEGRADOR)
  @ApiOperation({ summary: 'Ativa ou Revalida uma chave de licença' })
  async ativarLicenca(@Body() data: AtivarLicencaDTO) {
    return this.ativarUseCase.execute(data);
  }

  @Get('status/:instalacaoId')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO, PerfilOperador.PORTARIA)
  @ApiOperation({ summary: 'Verifica o status da licença (Backend e Edge)' })
  async getStatus(@Param('instalacaoId') instalacaoId: string): Promise<LicencaStatusDTO> {
    // return this.statusUseCase.execute(instalacaoId);
    
    // Mock
    return {
      status: StatusLicenca.ATIVA,
      modulos: [ModuloLicenca.CORE_ACESSO, ModuloLicenca.FACIAL],
      validade: new Date(),
    }
  }
}