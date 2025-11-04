import { Injectable } from '@nestjs/common';
import {
  CredencialParaValidacao,
  IPoliticaAcessoService,
  ValidacaoPayload,
  ValidacaoResultado,
} from '@app/domain';
import { ResultadoEvento } from '@prisma/client';
import { isBefore, isAfter } from 'date-fns';

@Injectable()
export class PoliticaAcessoService implements IPoliticaAcessoService {
  
  validar(payload: ValidacaoPayload): ValidacaoResultado {
    const { pontoAcessoId, credencial } = payload;
    const now = new Date();

    if (credencial.status === 'BLOQUEADA') {
      return { permitido: false, resultado: ResultadoEvento.NEGADO_LISTA_BLOQUEIO };
    }
    if (credencial.status !== 'ATIVA') {
      return { permitido: false, resultado: ResultadoEvento.NEGADO_CREDENCIAL_INVALIDA };
    }

    if (credencial.vigenciaFim && isBefore(now, credencial.vigenciaFim)) {
       return { permitido: false, resultado: ResultadoEvento.NEGADO_CREDENCIAL_EXPIRADA };
    }

    if (credencial.horarios) {
      const horarios = JSON.parse(credencial.horarios);
      if (!this.validarHorario(horarios, now)) {
        return { permitido: false, resultado: ResultadoEvento.NEGADO_POLITICA };
      }
    }
    
    if (credencial.pontoAcessoIds) {
       const pontosPermitidos = JSON.parse(credencial.pontoAcessoIds);
       if (!pontosPermitidos.includes(pontoAcessoId)) {
          return { permitido: false, resultado: ResultadoEvento.NEGADO_POLITICA };
       }
    }

    // 5. Anti-Passback (Fase 9.1)
    // (Lógica complexa: exigiria checar o último EventoDeAcesso da pessoa)
    // if (this.validarAntiPassback(pessoaId, pontoAcessoId) === false) {
    //   return { permitido: false, resultado: ResultadoEvento.NEGADO_ANTI_PASSBACK };
    // }

    return { permitido: true, resultado: ResultadoEvento.PERMITIDO };
  }
  
  private validarHorario(regras: any[], now: Date): boolean {
    // (Implementação da lógica de verificação de regras de horário)
    // Ex: [{ diaSemana: [1,2,3], inicio: "08:00", fim: "18:00" }]
    return true; // Mockado como permitido
  }
}