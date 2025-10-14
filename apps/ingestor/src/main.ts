import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Intermedius Ingestor API')
    .setDescription('Serviço para ingestão de eventos de conversas via webhooks.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Escuta em IPv6/IPv4 (evita problemas de localhost - ::1)
  await app.listen(process.env.INGESTOR_PORT || 3001, '::');
  console.log(`Ingestor service is running on: ${await app.getUrl()}/api/docs`);
}
bootstrap();