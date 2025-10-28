import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PolicyService (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Authentication Checks', () => {
    const testCases = [
      { name: 'Pillars', endpoint: '/pillars/campaign/some-uuid' },
      { name: 'Rules', endpoint: '/rules/campaign/some-uuid' },
      { name: 'Scripts', endpoint: '/scripts/campaign/some-uuid' },
    ];

    for (const { name, endpoint } of testCases) {
      describe(`${name} Module`, () => {
        it(`[${name}] should return 401 Unauthorized when accessing a protected route without a token`, () => {
          return request(app.getHttpServer())
            .get(endpoint)
            .expect(401);
        });

        it(`[${name}] should return 401 Unauthorized when accessing a protected route with an invalid token`, () => {
          return request(app.getHttpServer())
            .get(endpoint)
            .set('Authorization', 'Bearer invalidtoken')
            .expect(401);
        });
      });
    }
  });
});