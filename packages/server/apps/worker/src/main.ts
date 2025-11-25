import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  Logger.log('Worker está rodando e ouvindo a fila "conversation-events"...', 'WorkerApplication');
  
  await app.init();
}
bootstrap();
