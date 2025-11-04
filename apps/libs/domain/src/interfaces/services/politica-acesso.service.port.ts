import { ResultadoEvento } from '@prisma/client';

export interface CredencialParaValidacao {
  status: string;
  vigenciaFim?: Date | null;
  horarios?: string | null; 
  pontoAcessoIds?: string | null; 
}

export interface ValidacaoPayload {
  pontoAcessoId: string;
  credencial: CredencialParaValidacao;
}

export interface ValidacaoResultado {
  permitido: boolean;
  resultado: ResultadoEvento;
}

export interface IPoliticaAcessoService {
  validar(payload: ValidacaoPayload): ValidacaoResultado;
}

export const IPoliticaAcessoService = Symbol('IPoliticaAcessoService');