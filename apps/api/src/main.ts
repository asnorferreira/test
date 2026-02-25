import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AllExceptionsFilter } from "./core/filters/all-exceptions.filter";
import { TransformInterceptor } from "./core/interceptors/transform.interceptor";
import { ConfigService } from "@nestjs/config";
import { Env } from "./config/env.config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://maemais.com", "https://admin.maemais.com"]
        : "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("MãeMais API")
    .setDescription(
      "Documentação oficial da API MãeMais (Venda Direta & Casos Médicos)",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const configService = app.get(ConfigService<Env, true>);
  const port = configService.get("PORT", { infer: true });

  await app.listen(port);
  console.log(`API MãeMais rodando na porta ${port}`);
  console.log(
    `Documentação Swagger disponível em: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
