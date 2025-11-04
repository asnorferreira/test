export interface LicenseValidationPayload {
  chave: string;
  instalacaoId: string;
  boundInfo: Record<string, any>;
}

export interface LicenseValidationResult {
  status: 'ATIVA' | 'EXPIRADA' | 'INVALIDA' | 'BLOQUEADA';
  modulos: Record<string, any>;
  validade: Date;
  message?: string;
}

export interface ILicenseServerGateway {
  validate(payload: LicenseValidationPayload): Promise<LicenseValidationResult>;
}

export const ILicenseServerGateway = Symbol('ILicenseServerGateway');