import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { EdgeConfigService } from '../config/edge-config.service';
import { firstValueFrom } from 'rxjs';
import { ModuloLicenca, StatusLicenca } from '@prisma/client'; // (Usando enums da Lib)

// Interface local do status
export interface LocalLicenseStatus {
  status: StatusLicenca;
  modulos: ModuloLicenca[];
  validade: Date;
  lastCheck: Date;
}

@Injectable()
export class LicenseAgentService implements OnModuleInit {
  private readonly logger = new Logger(LicenseAgentService.name);
  private readonly backendUrl: string;
  private readonly instalacaoId: string; // (Vem do .env do Edge)

  // Cache local (em memória) do status da licença
  private localStatus: LocalLicenseStatus = {
    status: StatusLicenca.PENDENTE,
    modulos: [],
    validade: new Date(),
    lastCheck: new Date(0),
  };

  constructor(
    private readonly config: EdgeConfigService,
    private readonly http: HttpService,
  ) {
    this.backendUrl = this.config.getBackendUrl();
    this.instalacaoId = this.config.getInstalacaoId(); // (Precisa adicionar ao .env do Edge)
  }

  async onModuleInit() {
    this.logger.log('Iniciando Agente de Licença. Realizando verificação inicial...');
    await this.checkLicenseStatus();
  }

  @Interval('licenseCheck', 10 * 60 * 1000) // Verifica a cada 10 minutos
  async handleLicenseCheck() {
    await this.checkLicenseStatus();
  }

  /**
   * Verifica o status da licença contra o Backend (Cloud).
   */
  async checkLicenseStatus(): Promise<void> {
    if (!this.instalacaoId) {
      this.logger.error('INSTALACAO_ID não definido no .env do Edge. Licença bloqueada.');
      this.localStatus = { ...this.localStatus, status: StatusLicenca.BLOQUEADA };
      return;
    }
    
    try {
      const url = `${this.backendUrl}/v1/licencas/status/${this.instalacaoId}`;
      const response = await firstValueFrom(
        this.http.get<LocalLicenseStatus>(url),
        // (Autenticação do Edge)
      );
      
      this.localStatus = { ...response.data, lastCheck: new Date() };
      this.logger.log(`Licença atualizada: Status [${this.localStatus.status}], Validade [${this.localStatus.validade}]`);

    } catch (error) {
      this.logger.error('Falha ao verificar status da licença contra o Backend', error.message);
      // Se falhar a comunicação, entra em Modo Graça (se já estava Ativa)
      this.handleGraceMode();
    }
  }
  
  private handleGraceMode() {
    if (this.localStatus.status === StatusLicenca.ATIVA) {
      const agora = new Date();
      // Se a última checagem OK foi há menos de (ex) 3 dias
      if (agora.getTime() - this.localStatus.lastCheck.getTime() < 3 * 24 * 60 * 60 * 1000) {
        this.localStatus.status = StatusLicenca.MODO_GRACA;
        this.logger.warn('Entrando em MODO_GRACA por falha de comunicação.');
      } else {
        this.localStatus.status = StatusLicenca.BLOQUEADA;
        this.logger.error('Licença BLOQUEADA. Limite do MODO_GRACA excedido.');
      }
    }
  }

  /**
   * Usado pelos Guards para bloquear funcionalidades.
   */
  isModuleLicensed(modulo: ModuloLicenca): boolean {
    const statusValido = [StatusLicenca.ATIVA, StatusLicenca.MODO_GRACA].includes(
      this.localStatus.status,
    );
    
    if (!statusValido) return false;
    
    return this.localStatus.modulos.includes(modulo);
  }

  isCoreActive(): boolean {
     return [StatusLicenca.ATIVA, StatusLicenca.MODO_GRACA].includes(
       this.localStatus.status,
     );
  }
}