import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as client from 'prom-client';
import * as fs from 'fs';
import * as path from 'path';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'ingestor_' });

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  let fastifyOpts: any = { logger: true };

  if (isProd && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    try {
        const keyPath = path.resolve(process.env.SSL_KEY_PATH);
        const certPath = path.resolve(process.env.SSL_CERT_PATH);
        
        fastifyOpts.https = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
        console.log('Ingestor Service: HTTPS ativado com sucesso.');
    } catch (e) {
        console.error('Ingestor Service: Erro ao carregar certificados SSL. Iniciando em HTTP.', e);
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

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Intermedius Ingestor API')
    .setDescription('Serviço para ingestão de eventos de conversas via webhooks.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.INGESTOR_PORT || 3001, '::');
  console.log(`Ingestor service is running on: ${await app.getUrl()}/api/docs`);
}
bootstrap();