import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/infra/database/prisma/prisma.service";
import { MailPort } from "@/core/ports/mail.port";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let users: any[] = [];

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return users.find((u) => u.email === where.email) || null;
      }),

      create: jest.fn().mockImplementation(({ data }) => {
        const newUser = {
          id: crypto.randomUUID(),
          ...data,
        };

        users.push(newUser);

        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        };
      }),

      deleteMany: jest.fn().mockImplementation(() => {
        users = [];
        return { count: 0 };
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const mockMailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(MailPort)
      .useValue(mockMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  beforeEach(() => {
    users = [];
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const testUser = {
    name: "E2E User",
    email: "e2e@test.com",
    password: "password123",
  };

  it("/auth/register (POST) - Sucesso", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(testUser.email);

    await new Promise((resolve) => setImmediate(resolve));

    expect(mockMailService.sendEmail).toHaveBeenCalled();
  });

  it("/auth/register (POST) - Falha: E-mail Duplicado", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(409);
  });

  it("/auth/login (POST) - Sucesso", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
  });

  it("/auth/login (POST) - Falha: Senha Incorreta", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .send(testUser)
      .expect(201);

    await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      })
      .expect(401);
  });
});
