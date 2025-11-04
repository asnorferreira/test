import { FabricanteDispositivo, StatusDispositivo } from '@prisma/client';

export interface DeviceConfig {
  id: string;
  nome: string;
  ip: string;
  porta: number;
  fabricante: FabricanteDispositivo;
  modelo?: string;
  driver: string;
  usuario?: string;
  senha?: string;
}

export interface DeviceHealth {
  status: StatusDispositivo;
  message?: string;
  firmware?: string;
  lastHeartbeat?: Date;
}

export interface RawDeviceEvent {
  dispositivoId: string;
  timestamp: Date;
  tipo:
    | 'VALID_READ'
    | 'INVALID_READ'
    | 'DOOR_OPEN'
    | 'TAMPER'
    | 'COERCION'
    | 'ERROR';
  
  payload: {
    valorCredencial?: string;
    tipoCredencial?: string;
    direcao?: 'ENTRADA' | 'SAIDA';
    
    meta?: Record<string, any>;
  };
}

export interface ActuationOptions {
  operadorNome?: string;
  justificativa?: string;
}

export interface ActuationResult {
  success: boolean;
  message?: string;
}

export interface EnrollmentPayload {
  pessoaId: string;
  templateData: Buffer | string; 
}

export interface EnrollmentResult {
  success: boolean;
  templateId?: string;
}