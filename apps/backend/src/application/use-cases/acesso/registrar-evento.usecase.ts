import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  EventoAcessoCreateInput,
  IEventoAcessoRepository,
  ICameraGateway, 
} from '@app/domain';
import { EventoDeAcessoDTO } from '@app/domain';

@Injectable()
export class RegistrarEventoUseCase {
  private readonly logger = new Logger(RegistrarEventoUseCase.name);

  constructor(
    @Inject(IEventoAcessoRepository)
    private readonly eventoRepository: IEventoAcessoRepository,
    @Inject(ICameraGateway)
    private readonly cameraGateway: ICameraGateway,
  ) {}

  async execute(dto: EventoDeAcessoDTO): Promise<void> {
    const input: EventoAcessoCreateInput = {
      ...dto,
      dataHora: new Date(dto.dataHora),
      pontoId: dto.pontoId,
      pessoaId: dto.pessoaId || undefined,
      credencialId: dto.credencialId || undefined,
    };

    try {
      const eventoSalvo = await this.eventoRepository.append(input);
      this.capturarSnapshot(eventoSalvo.id, eventoSalvo.pontoId);
    } catch (error) {
      this.logger.error(`Falha ao registrar evento`, error);
    }
  }
  private async capturarSnapshot(eventoId: bigint, pontoId: string) {
    this.logger.debug(`[Snapshot] Solicitando captura para Evento [${eventoId}]`);
    const uri = await this.cameraGateway.snapshot(pontoId, eventoId);

    if (uri !== 'error:snapshot_failed') {
      await this.eventoRepository.update(eventoId, { snapshotUri: uri });
      this.logger.debug(`[Snapshot] URI [${uri}] salva no Evento [${eventoId}]`);
    }
  }
}