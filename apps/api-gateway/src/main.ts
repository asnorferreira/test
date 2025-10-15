import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../../libs/prisma/src/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as client from 'prom-client';
import * as fs from 'fs';
import * as path from 'path';

client.collectDefaultMetrics({ prefix: 'api_gateway_' });

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  let fastifyOpts: any = { logger: true }

  if (isProd && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    try {
        const keyPath = path.resolve(process.env.SSL_KEY_PATH);
        const certPath = path.resolve(process.env.SSL_CERT_PATH);
        
        fastifyOpts.https = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
        console.log('HTTPS/WSS ativado com sucesso.');
    } catch (e) {
        console.error('Erro ao carregar certificados SSL. Iniciando em HTTP.', e);
    }
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyOpts),
  );

  app.getHttpAdapter().get('/metrics', async (req, res) => {
    res.header('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Intermedius API Gateway')
    .setDescription('BFF principal para autenticação, usuários e roteamento.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`API Gateway is running on: ${await app.getUrl()}/api/docs`);
}
bootstrap();