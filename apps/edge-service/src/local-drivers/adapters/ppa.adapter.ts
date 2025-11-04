import {
  IDeviceConnector,
  DeviceConfig,
  DeviceHealth,
  ActuationResult,
} from '@app/domain';
import { Logger } from '@nestjs/common';
import { StatusDispositivo } from '@prisma/client';

export class PPAAdapter implements IDeviceConnector {
  private readonly logger = new Logger(PPAAdapter.name);
  private config: DeviceConfig;
  private isConnected = false;

  async connect(cfg: DeviceConfig): Promise<void> {
    this.logger.log(`[${cfg.nome}] Conectando a PPA em ${cfg.ip}:${cfg.porta}...`);
    this.config = cfg;
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async health(): Promise<DeviceHealth> {
    return { status: StatusDispositivo.ONLINE, lastHeartbeat: new Date() };
  }

  async listenEvents(
    onEvent: (evt: any) => Promise<void>,
  ): Promise<void> {
    this.logger.warn(
      `[${this.config.nome}] listenEvents não é suportado por este driver (PPA).`,
    );
  }

  async open(channel: number = 0): Promise<ActuationResult> {
    this.logger.log(`[${this.config.nome}] Acionando PPA (ABRIR)`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  }

  async close(channel: number = 0): Promise<ActuationResult> {
    this.logger.log(`[${this.config.nome}] Acionando PPA (FECHAR)`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  }
}