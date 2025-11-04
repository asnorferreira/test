import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-edge'; 
import { EdgeConfigService } from '../config/edge-config.service';

@Injectable()
export class EdgePrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(EdgePrismaService.name);
  
  constructor(config: EdgeConfigService) {
    super({
      datasources: {
        db: {
          url: config.getEdgeDbUrl(),
        },
      },
    });
  }

  async onModuleInit() {
    this.logger.log('Conectando ao banco de dados local (SQLite)...');
    try {
      await this.$connect();
      this.logger.log('Banco local (SQLite) conectado.');
    } catch (error) {
       this.logger.error('Falha ao iniciar SQLite', error);
       process.exit(1);
    }
  }
}