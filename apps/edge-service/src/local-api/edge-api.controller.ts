import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { LocalApiKeyGuard } from './local-api-key.guard';
import { ComandoAbrirDTO } from '@app/domain/dtos/comando-abrir.dto'; 
import { ValidarAcessoDTO } from '@app/domain/dtos/validar-acesso.dto';
import { EdgeHealthService } from '../health/edge-health.service';
import { EdgeDriverService } from '../local-drivers/edge-driver.service';
import { LicenseGuard, RequireModule } from '../licenca/license.guard'; // (Novo)
import { ModuloLicenca } from '@prisma/client';

@Controller('edge-local')
@UseGuards(LocalApiKeyGuard, LicenseGuard)
export class EdgeApiController {
  constructor(
    private readonly healthService: EdgeHealthService,
    private readonly driverService: EdgeDriverService,
  ) {}

  @Get('health')
  async getHealth() {
    // Fase 5.a: Health dos drivers
    return this.healthService.getAggregatedHealth();
  }

  @Post('acionar')
  @RequireModule(ModuloLicenca.CORE_ACESSO)
  async acionarDispositivo(@Body() data: ComandoAbrirDTO) {
    // Fase 9: Acionamento manual (roteia para o driver correto)
    return this.driverService.acionar(data.pontoId, data.justificativa);
  }

  @Post('validar')
  @RequireModule(ModuloLicenca.CORE_ACESSO)
  async validarAcesso(@Body() data: ValidarAcessoDTO) {
    // Fase 9: Validação offline-first
    // 1. Checa no Cache (SQLite)
    // 2. Se não encontrar, fallback para o Backend (Cloud)
    // 3. Enfileira o evento na Fila Local (SQLite)
  }
  
  @Post('facial/sincronizar')
  @RequireModule(ModuloLicenca.FACIAL) // (Protege o módulo facial)
  async syncFacial() {
     // Endpoint que o Backend (Fase 10) chama (via MessageBus)
  }
}