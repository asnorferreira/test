import {
  DeviceConfig,
  DeviceHealth,
  RawDeviceEvent,
  ActuationOptions,
  ActuationResult,
  EnrollmentPayload,
  EnrollmentResult,
} from './device-connector.dto';

export interface IDeviceConnector {
  connect(cfg: DeviceConfig): Promise<void>;

  disconnect(): Promise<void>;
  
  health(): Promise<DeviceHealth>;
  
  listenEvents(
    onEvent: (evt: RawDeviceEvent) => Promise<void>,
  ): Promise<void>;

  open(channel: number, options?: ActuationOptions): Promise<ActuationResult>;
  
  close?(channel: number, options?: ActuationOptions): Promise<ActuationResult>;
  
  enroll?(data: EnrollmentPayload): Promise<EnrollmentResult>;
  
  unenroll?(personId: string): Promise<boolean>;
  
  syncWhitelist?(credentials: string[]): Promise<void>;
}

export const IDeviceConnectorFactory = Symbol('IDeviceConnectorFactory');

export interface IDeviceConnectorFactory {
  
    createConnector(driverName: string): IDeviceConnector;
}