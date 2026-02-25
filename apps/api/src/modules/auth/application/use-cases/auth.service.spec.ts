import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

import { AuthService } from "./auth.service";
import { UserRepository } from "@/modules/users/domain/repositories/user.repository";
import { User } from "@/modules/users/domain/entities/user.entity";
import { UserRole } from "@maemais/shared-types";

jest.mock("bcryptjs");

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("mocked-jwt-token"),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    eventEmitter = module.get(EventEmitter2);
    jwtService = module.get(JwtService);
  });

  describe("login", () => {
    it("deve retornar accessToken e dados do usuário ao fazer login com sucesso", async () => {
      const mockUser = User.create({
        name: "Maria",
        email: "maria@test.com",
        passwordHash: "hashed-password",
        role: UserRole.PATIENT,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: "maria@test.com",
        password: "password123",
      });

      expect(result.accessToken).toBe("mocked-jwt-token");
      expect(result.user.email).toBe("maria@test.com");

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.props.email,
        role: mockUser.props.role,
      });
    });

    it("deve lançar UnauthorizedException se o usuário não existir", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "wrong@test.com",
          password: "123",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("deve lançar UnauthorizedException se a senha estiver incorreta", async () => {
      const mockUser = User.create({
        name: "Maria",
        email: "maria@test.com",
        passwordHash: "hashed-password",
        role: UserRole.PATIENT,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: "maria@test.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("registerPatient", () => {
    it("deve registrar paciente, gerar token e emitir evento", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      const result = await authService.registerPatient({
        name: "Ana",
        email: "ana@test.com",
        password: "password123",
      });

      expect(userRepository.create).toHaveBeenCalled();
      expect(result.accessToken).toBe("mocked-jwt-token");
      expect(result.user.email).toBe("ana@test.com");

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "user.registered",
        expect.objectContaining({
          email: "ana@test.com",
        }),
      );
    });

    it("deve lançar ConflictException se o e-mail já estiver em uso", async () => {
      const existingUser = User.create({
        name: "Old",
        email: "ana@test.com",
        passwordHash: "hash",
        role: UserRole.PATIENT,
      });

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authService.registerPatient({
          name: "Ana",
          email: "ana@test.com",
          password: "123",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
