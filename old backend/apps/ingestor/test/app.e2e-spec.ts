import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
describe('IngestorController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ingestor/webhook (POST)', () => {
    it('should accept a valid event payload and return 202 Accepted', () => {
      const validPayload = {
        author: 'cliente',
        text: 'Olá, gostaria de negociar.',
        timestamp: new Date().toISOString(),
        metadata: {
          conversationId: 'e2e-test-conv-123',
          channel: 'whatsapp',
        },
      };

      return request(app.getHttpServer())
        .post('/ingestor/webhook')
        .send(validPayload)
        .expect(202)
        .expect({ status: 'event received' });
    });

    it('should reject an invalid event payload and return 400 Bad Request', () => {
      const invalidPayload = {
        text: 'Payload inválido.',
        timestamp: new Date().toISOString(),
        metadata: {
          conversationId: 'e2e-test-conv-456',
          channel: 'chat',
        },
      };

      return request(app.getHttpServer())
        .post('/ingestor/webhook')
        .send(invalidPayload)
        .expect(400);
    });
  });
});