import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegistrarEventoUseCase } from '@application/use-cases/acesso/registrar-evento.usecase';
import { EventoDeAcessoDTO } from '@app/domain';
// import { EdgeAuthGuard } 
// TODO: Um guard específico para o Edge

@ApiTags('Edge API (Sync)')
// @UseGuards(EdgeAuthGuard)
@Controller('/v1/edge')
export class EdgeController {
  private readonly logger = new Logger(EdgeController.name);

  constructor(
    private readonly registrarEventoUseCase: RegistrarEventoUseCase,
  ) {}

  @Post('eventos')
  @ApiOperation({ summary: 'Ingestão (Batch) de eventos vindos do Edge' })
  async ingestEventos(@Body() eventos: EventoDeAcessoDTO[]) {
    this.logger.log(`Recebendo lote de [${eventos.length}] eventos do Edge.`);
    
    // Processa em paralelo, mas sem bloquear
    Promise.all(
      eventos.map(evento => this.registrarEventoUseCase.execute(evento))
    );

    return { received: eventos.length };
  }

  @Get('sync/credenciais')
  @ApiOperation({ summary: 'Endpoint de Pull do Edge para credenciais' })
  async syncCredenciais() {
    // (Lógica da Fase 5.e - pullCredenciaisCache)
    // return this.syncCredenciaisUseCase.execute(since);
  }
}