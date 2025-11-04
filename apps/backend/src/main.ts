import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  INestApplication,
  Logger,
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestWinstonFactory } from 'apps/backend/src/infrastructure/observability/winston-logger.factory';
import { AppConfig } from 'apps/backend/src/infrastructure/config/config.service';
import { OpenTelemetrySdk } from 'apps/backend/src/infrastructure/observability/opentelemetry.sdk';
import { CorrelationIdMiddleware } from 'apps/backend/src/core/middlewares/correlation-id.middleware';

const logger = new Logger('Bootstrap'); 

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: NestWinstonFactory(process.env.APP_NAME || 'condominio-backend'),
    bufferLogs: true,
  });

  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get('PORT', { infer: true });
  const nodeEnv = configService.get('NODE_ENV', { infer: true });

  if (nodeEnv !== 'production') {
    OpenTelemetrySdk.start();
    logger.log('OpenTelemetry SDK iniciado.');
  }

  app.useLogger(app.get(Logger));
  app.use(CorrelationIdMiddleware);
  app.use(helmet());

  app.enableCors({
    origin: '*', // TODO: Restringir em produção
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupSwagger(app, configService);

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`Aplicação iniciada no ambiente: ${nodeEnv}`);
  logger.log(`Servidor rodando em: http://localhost:${port}`);
  logger.log(`Swagger UI em: http://localhost:${port}/api/docs`);
}

function setupSwagger(
  app: INestApplication,
  configService: ConfigService<AppConfig, true>,
) {
  const appName = configService.get('APP_NAME', { infer: true });

  const config = new DocumentBuilder()
    .setTitle(`${appName} - API`)
    .setDescription(
      'Documentação Técnica da API do Sistema de Controle de Acesso',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token OIDC (JWT)',
        in: 'header',
      },
      'OIDC-Auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });
}

bootstrap().catch((err) => {
  logger.error('Erro fatal ao iniciar a aplicação', err);
  process.exit(1);
});