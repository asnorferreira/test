import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'libs/prisma/src/prisma.service';

describe('API Gateway (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const tenantSlug = 'demo';
  const password = 'strongPassword123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.tenant.upsert({
      where: { slug: tenantSlug },
      update: {},
      create: { name: 'Demo Tenant', slug: tenantSlug },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: uniqueEmail } });
    await app.close();
  });

  describe('Auth Module (/auth)', () => {
    it('POST /auth/register -> should fail if tenant does not exist', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          tenantSlug: 'non-existent-tenant',
        })
        .expect(400);
    });

    it('POST /auth/register -> should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          tenantSlug: tenantSlug,
          displayName: 'E2E Test User',
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toEqual(uniqueEmail);
        });
    });

    it('POST /auth/register -> should fail if user already exists', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: password,
          tenantSlug: tenantSlug,
        })
        .expect(400);
    });

    it('POST /auth/login -> should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'wrong-password',
          tenantSlug: tenantSlug,
        })
        .expect(401);
    });

    it('POST /auth/login -> should login successfully and return an access token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: password,
          tenantSlug: tenantSlug,
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('access_token');
          accessToken = res.body.access_token;
        });
    });
  });

  describe('Users Module (/users)', () => {
    it('GET /users/me -> should fail without an authentication token', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('GET /users/me -> should return the authenticated user profile', () => {
      expect(accessToken).toBeDefined();
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toEqual(uniqueEmail);
          expect(res.body.tenant).toBeDefined();
          expect(res.body.tenant.slug).toEqual(tenantSlug);
        });
    });
  });
});