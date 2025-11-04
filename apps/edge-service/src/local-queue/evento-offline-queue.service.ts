import { Injectable, Logger } from '@nestjs/common';
import { EdgePrismaService } from '../persistence/edge-prisma.service';
import { EventoDeAcessoDTO } from '@app/domain';

@Injectable()
export class EventoOfflineQueueService {
  private readonly logger = new Logger(EventoOfflineQueueService.name);

  constructor(private readonly edgePrisma: EdgePrismaService) {}

  async enqueue(evento: Omit<EventoDeAcessoDTO, 'id'>): Promise<void> {
    try {
      await this.edgePrisma.eventoOffline.create({
        data: {
          payload: JSON.stringify(evento),
        },
      });
    } catch (error) {
      this.logger.error('Falha ao enfileirar evento offline', error);
    }
  }
}