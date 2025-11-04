import {
  IDeviceConnector,
  DeviceConfig,
  DeviceHealth,
  RawDeviceEvent,
  ActuationResult,
} from '@app/domain';
import { Logger } from '@nestjs/common';
import { StatusDispositivo } from '@prisma/client';

export class ZKTecoAdapter implements IDeviceConnector {
  private readonly logger = new Logger(ZKTecoAdapter.name);
  private config: DeviceConfig;
  private isConnected = false;
  private eventCallback: (evt: RawDeviceEvent) => Promise<void>;

  async connect(cfg: DeviceConfig): Promise<void> {
    this.logger.log(`[${cfg.nome}] Conectando a ZKTeco em ${cfg.ip}:${cfg.porta}...`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simula latência
    this.config = cfg;
    this.isConnected = true;
    this.logger.log(`[${cfg.nome}] Conectado.`);
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.logger.log(`[${this.config.nome}] Desconectado.`);
  }

  async health(): Promise<DeviceHealth> {
    if (!this.isConnected) {
      return { status: StatusDispositivo.OFFLINE };
    }
    const isOnline = Math.random() > 0.1;
    
    return {
      status: isOnline ? StatusDispositivo.ONLINE : StatusDispositivo.COM_FALHA,
      message: isOnline ? 'OK' : 'Ping failed',
      firmware: 'ZK 5.1.2',
      lastHeartbeat: new Date(),
    };
  }

  async listenEvents(
    onEvent: (evt: RawDeviceEvent) => Promise<void>,
  ): Promise<void> {
    this.logger.log(`[${this.config.nome}] Iniciando listener de eventos...`);
    this.eventCallback = onEvent;

    setInterval(() => {
      if (this.isConnected && this.eventCallback) {
        this.logger.log(`[${this.config.nome}] Simulando evento de leitura...`);
        this.eventCallback({
          dispositivoId: this.config.id,
          timestamp: new Date(),
          tipo: 'VALID_READ',
          payload: {
            valorCredencial: '12345678',
            tipoCredencial: 'CARTAO_PROXIMIDADE',
            direcao: 'ENTRADA',
          },
        });
      }
    }, 30000);
  }

  async open(channel: number = 0): Promise<ActuationResult> {
    if (!this.isConnected) {
      return { success: false, message: 'Dispositivo offline' };
    }
    
    this.logger.log(`[${this.config.nome}] Acionando relé [${channel}] (ABRIR)`);
    await new Promise(resolve => setTimeout(resolve, 50)); // Latência do relé
    
    return { success: true };
  }
}