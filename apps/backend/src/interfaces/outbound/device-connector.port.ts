export interface DeviceConfig {
  id: string;
  ip: string;
  porta: number;
  usuario?: string;
  senha?: string;
  modelo: string;
}

export interface DeviceHealth {
  status: 'ONLINE' | 'OFFLINE' | 'FALHA';
  message?: string;
  firmware?: string;
}

export interface RawDeviceEvent {
  timestamp: Date;
  eventType: 'VALID_READ' | 'INVALID_READ' | 'DOOR_OPEN' | 'TAMPER';
  payload: {
    cardId?: string;
    fingerprintId?: string;
    faceId?: string;
    direction?: 'IN' | 'OUT';
  };
}

export interface ActuationOptions {
  operadorId?: string;
  justificativa?: string;
}

export interface ActuationResult {
  success: boolean;
  message?: string;
}

export interface EnrollmentPayload {
  personId: string;
  templateData: Buffer | string;
}
export interface EnrollmentResult {
  success: boolean;
  templateId?: string;
}

export interface IDeviceConnector {
  connect(cfg: DeviceConfig): Promise<void>;
  health(): Promise<DeviceHealth>;
  listenEvents(onEvent: (evt: RawDeviceEvent) => void): Promise<void>;
  open(accessPointId?: string, options?: ActuationOptions): Promise<ActuationResult>;
  close?(accessPointId?: string, options?: ActuationOptions): Promise<ActuationResult>;
  enroll?(data: EnrollmentPayload): Promise<EnrollmentResult>;
}

export const IDeviceConnectorFactory = Symbol('IDeviceConnectorFactory');
export interface IDeviceConnectorFactory {
  createConnector(driverName: string): IDeviceConnector;
}