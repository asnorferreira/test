import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('API_PORT', 3333);
  const globalPrefix = configService.get<string>('API_GLOBAL_PREFIX', 'api/v1');

  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: 'http://localhost:3000', // Altere para a URL do seu frontend
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('JSP Carreiras API')
    .setDescription('Documentação da API para o portal de carreiras JSP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  await app.listen(port);
  console.log(`🚀 API rodando em: http://localhost:${port}/${globalPrefix}`);
  console.log(`📚 Swagger docs em: http://localhost:${port}/${globalPrefix}/docs`);
}
bootstrap();