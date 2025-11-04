import {
  IDeviceConnector,
  DeviceConfig,
  DeviceHealth,
  ActuationResult,
} from '@app/domain';
import { Logger } from '@nestjs/common';
import { StatusDispositivo } from '@prisma/client';

export class ImecontronAdapter implements IDeviceConnector {
  private readonly logger = new Logger(ImecontronAdapter.name);
  private config: DeviceConfig;
  
  async connect(cfg: DeviceConfig): Promise<void> {
    this.logger.log(`[${cfg.nome}] Conectando a Imecontron ${cfg.ip}...`);
    this.config = cfg;
  }
  
  async disconnect(): Promise<void> {}

  async health(): Promise<DeviceHealth> {
    return { status: StatusDispositivo.ONLINE, lastHeartbeat: new Date() };
  }

  async listenEvents(onEvent: any): Promise<void> {
     this.logger.warn(`[${this.config.nome}] listenEvents não suportado.`);
  }

  async open(channel: number = 0): Promise<ActuationResult> {
    this.logger.log(`[${this.config.nome}] Acionando Imecontron (ABRIR)`);
    return { success: true };
  }
}