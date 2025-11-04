import { PrismaTransaction } from 'apps/backend/src/interfaces/outbound/repositories/base.repository.port';
import {
  Injectable,
  Logger,
  OnModuleInit,
  INestApplication,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    this.logger.log('Conectando ao banco de dados...');
    try {
      await this.$connect();
      this.logger.log('Conexão com o banco de dados estabelecida com sucesso.');

      if (process.env.NODE_ENV !== 'production') {
        this.$on('query', (e) => {
          this.logger.debug(`Query: ${e.query}`);
          this.logger.debug(`Params: ${e.params}`);
          this.logger.debug(`Duration: ${e.duration}ms`);
        });
      }
    } catch (error) {
      this.logger.error('Falha ao conectar ao banco de dados', error);
      process.exit(1);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      this.logger.log('Desconectando do banco de dados...');
      await app.close();
      await this.$disconnect();
    });
  }

  async runInTransaction<T>(
    fn: (tx: PrismaTransaction) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
    },
  ): Promise<T> {
    return this.$transaction(fn, options);
  }
}