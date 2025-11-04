import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { EdgeConfigService } from '../config/edge-config.service';
import { EdgePrismaService } from '../persistence/edge-prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly backendUrl: string;
  private isSyncing = false;

  constructor(
    private readonly config: EdgeConfigService,
    private readonly http: HttpService,
    private readonly edgePrisma: EdgePrismaService,
  ) {
    this.backendUrl = this.config.getBackendUrl();
  }

  @Interval('syncJob', this.config.getSyncInterval())
  async handleSync() {
    if (this.isSyncing) {
      this.logger.warn('Sincronização anterior ainda em andamento. Pulando.');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Iniciando ciclo de sincronização (Push/Pull)...');

    try {
      await this.pushEventosOffline();
      await this.pullCredenciaisCache();
    } catch (error) {
      this.logger.error('Falha no ciclo de sincronização', error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushEventosOffline(): Promise<void> {
    const eventos = await this.edgePrisma.eventoOffline.findMany({
      where: { enviado: false },
      take: 100,
    });

    if (eventos.length === 0) return;
    this.logger.log(`Enviando [${eventos.length}] eventos offline para a nuvem...`);

    try {
      const payloads = eventos.map(e => JSON.parse(e.payload));

      await firstValueFrom(
        this.http.post(`${this.backendUrl}/v1/edge/eventos`, payloads),
        // TODO: Adicionar autenticação (OIDC Device Code ou API Key)
      );

      await this.edgePrisma.eventoOffline.updateMany({
        where: { id: { in: eventos.map((e) => e.id) } },
        data: { enviado: true },
      });
    } catch (error) {
      this.logger.error('Falha ao enviar eventos (Push)', error.response?.data);
    }
  }

  async pullCredenciaisCache(): Promise<void> {
    this.logger.log('Buscando atualizações de credenciais (Pull)...');
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.backendUrl}/v1/edge/sync/credenciais`),
        // TODO: Adicionar timestamp 'since' para sync incremental
      );
      
      const credenciais = response.data as any[];
      if (credenciais.length === 0) return;
      this.logger.log(`Recebidas [${credenciais.length}] credenciais para cache.`);

      for (const cred of credenciais) {
        const cacheData = {
          ...cred,
          pontoAcessoIds: cred.pontoAcessoIds ? JSON.stringify(cred.pontoAcessoIds) : null,
          horarios: cred.horarios ? JSON.stringify(cred.horarios) : null,
        };

        await this.edgePrisma.credencialCache.upsert({
          where: { valor: cacheData.valor },
          update: cacheData,
          create: cacheData,
        });
      }
      
    } catch (error) {
      this.logger.error('Falha ao buscar credenciais (Pull)', error.response?.data);
    }
  }
}