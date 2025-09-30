import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { PrismaService } from './modules/prisma/prisma.service'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const prisma = app.get(PrismaService)
  await prisma.enableShutdownHooks(app)

  await app.listen(3000, '0.0.0.0')
}

void bootstrap()
