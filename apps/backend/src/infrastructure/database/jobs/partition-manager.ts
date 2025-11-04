import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { PartitionService } from './partition.service';
import { ConfigAppModule } from 'apps/backend/src/infrastructure/config/config.module';

async function bootstrap() {
  const logger = new Logger('PartitionManagerJob');
  logger.log('Inicializando contexto da aplicação para o Job...');

  const app = await NestFactory.createApplicationContext(DatabaseModule, {
    imports: [ConfigAppModule],
    logger: ['log', 'warn', 'error', 'debug'],
  });

  const partitionService = app.get(PartitionService);

  logger.log('Iniciando Job de manutenção de partições...');

  try {
    await partitionService.ensurePartitions();
  } catch (error) {
    logger.error('Erro fatal durante a execução do Job de partição', error);
    process.exit(1);
  }

  logger.log('Job de manutenção de partições concluído com sucesso.');
  await app.close();
  process.exit(0);
}

bootstrap();