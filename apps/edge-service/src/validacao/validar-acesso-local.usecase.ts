// apps/edge-service/src/validacao/validar-acesso-local.usecase.ts
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { EdgePrismaService } from '../persistence/edge-prisma.service';
import {
  IPoliticaAcessoService,
  IDeviceConnectorFactory,
  ValidarAcessoDTO,
  RawDeviceEvent,
  IDeviceConnector,
} from '@app/domain';
import { PoliticaAcessoService } from 'apps/backend/src/1-domain/services/politica-acesso.service'; // (Reutilizando)
import { AcaoEvento, ResultadoEvento, StatusDispositivo } from '@prisma/client';
import { EdgeDriverService } from '../local-drivers/edge-driver.service';
import { EventoOfflineQueueService } from '../local-queue/evento-offline-queue.service';

@Injectable()
export class ValidarAcessoLocalUseCase {
  private readonly logger = new Logger(ValidarAcessoLocalUseCase.name);

  constructor(
    private readonly edgePrisma: EdgePrismaService,
    private readonly driverService: EdgeDriverService,
    private readonly queueService: EventoOfflineQueueService,
    private readonly politicaAcessoService: PoliticaAcessoService, 
  ) {}

  async execute(dto: ValidarAcessoDTO): Promise<{ resultado: ResultadoEvento }> {
    let resultado: ResultadoEvento;
    let credencialId: string | undefined;
    let pessoaId: string | undefined;

    try {
      const credencialCache = await this.edgePrisma.credencialCache.findUnique({
        where: { valor: dto.valorCredencial },
      });

      if (!credencialCache) {
        // TODO: Fallback Online (Fase 9.2) - Chamar API do Backend
        this.logger.warn(`Credencial [${dto.valorCredencial}] não encontrada no cache.`);
        throw new NotFoundException(ResultadoEvento.NEGADO_CREDENCIAL_INVALIDA);
      }
      
      credencialId = credencialCache.id;
      pessoaId = credencialCache.pessoaId;

      const validacao = this.politicaAcessoService.validar({
        pontoAcessoId: dto.pontoAcessoId,
        credencial: credencialCache,
      });

      resultado = validacao.resultado;

      if (validacao.permitido) {
        const acionamento = await this.driverService.acionar(
          dto.pontoAcessoId,
          'Acesso automático',
        );
        if (!acionamento.success) {
          resultado = ResultadoEvento.ERRO_DISPOSITIVO;
        }
      }
      
    } catch (error) {
      resultado = error?.message || ResultadoEvento.ERRO_COMUNICACAO;
      this.logger.error(`Erro na validação local: ${resultado}`, error.stack);
    }

    await this.queueService.enqueue({
      pontoId: dto.pontoAcessoId,
      credencialId: credencialId,
      pessoaId: pessoaId,
      acao: AcaoEvento.ENTRADA,
      resultado: resultado,
      dataHora: new Date().toISOString(),
      meta: { 
        driver: dto.driverHint,
        edgeId: "edge-01",
      },
    });

    return { resultado };
  }
}