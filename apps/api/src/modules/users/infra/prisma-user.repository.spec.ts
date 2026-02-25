import { Test, TestingModule } from "@nestjs/testing";
import { PrismaUserRepository } from "./prisma-user.repository";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { User } from "../domain/entities/user.entity";
import { UserRole } from "@maemais/shared-types";

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prisma = module.get(PrismaService);
  });

  it("deve salvar um usuário no banco", async () => {
    const user = User.create({
      name: "Teste",
      email: "t@t.com",
      passwordHash: "hash",
      role: UserRole.PATIENT,
    });
    await repository.create(user);
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
