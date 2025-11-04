import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import {
  IAuditoriaRepository,
  ComandoAbrirDTO,
  IMessageBus,
} from '@app/domain';
import { JwtPayload } from '@infrastructure/security/jwt.payload.interface';
import { AcaoEvento, ResultadoEvento, TipoAuditoria } from '@prisma/client';
import { RegistrarEventoUseCase } from './registrar-evento.usecase';

@Injectable()
export class AcionamentoManualUseCase {
  private readonly logger = new Logger(AcionamentoManualUseCase.name);
  private readonly deviceCommandTopic: string;

  constructor(
    @Inject(IAuditoriaRepository)
    private readonly auditoriaRepo: IAuditoriaRepository,
    @Inject(IMessageBus)
    private readonly messageBus: IMessageBus,
    private readonly registrarEvento: RegistrarEventoUseCase,
  ) {
    this.deviceCommandTopic = process.env.TOPIC_DEVICE_COMMANDS!;
  }

  async execute(dto: ComandoAbrirDTO, user: JwtPayload): Promise<void> {
    if (!dto.justificativa || dto.justificativa.length < 5) {
      throw new BadRequestException('Justificativa é obrigatória para acionamento manual.');
    }

    // TODO: O Edge Service (ainda não implementado) deve ouvir esta fila
    this.logger.log(`[AUDITORIA] Operador [${user.nome}] acionando Ponto [${dto.pontoId}]`);
    await this.messageBus.publish(this.deviceCommandTopic, {
      pontoId: dto.pontoId,
      comando: 'OPEN',
      operadorNome: user.nome,
      justificativa: dto.justificativa,
    });

    await this.auditoriaRepo.create({
      operadorId: user.id,
      operadorNome: user.nome,
      acao: 'ACIONAMENTO_MANUAL',
      recursoTipo: 'PontoDeAcesso',
      recursoId: dto.pontoId,
      justificativa: dto.justificativa,
      tipo: TipoAuditoria.ACIONAMENTO_MANUAL,
    });

    await this.registrarEvento.execute({
      pontoId: dto.pontoId,
      acao: AcaoEvento.ACIONAMENTO_MANUAL,
      resultado: ResultadoEvento.PERMITIDO,
      dataHora: new Date().toISOString(),
      meta: {
        operadorId: user.id,
        operadorNome: user.nome,
        justificativa: dto.justificativa,
      },
    });
  }
}