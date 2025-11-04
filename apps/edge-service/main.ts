import { NestFactory } from '@nestjs/core';
import { EdgeAppModule } from './edge-app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EdgeConfigService } from './config/edge-config.service';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('EdgeBootstrap');
  
  const app = await NestFactory.create(EdgeAppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  const configService = app.get(EdgeConfigService);
  const port = configService.getEdgePort();
  const nodeEnv = configService.getNodeEnv();

  app.use(helmet());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port, '127.0.0.1');

  logger.log(`Edge Service (Local) iniciado no ambiente: ${nodeEnv}`);
  logger.log(`Ouvindo localmente em: http://127.0.0.1:${port}`);
}

bootstrap().catch((err) => {
  console.error('Erro fatal ao iniciar Edge Service', err);
  process.exit(1);
});