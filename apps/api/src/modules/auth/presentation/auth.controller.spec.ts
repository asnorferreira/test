import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../application/use-cases/auth.service";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest
              .fn()
              .mockResolvedValue({ accessToken: "token", user: {} }),
            registerPatient: jest
              .fn()
              .mockResolvedValue({ accessToken: "token", user: {} }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it("deve ser definido", () => {
    expect(authController).toBeDefined();
  });

  it("deve chamar authService.login", async () => {
    const dto = { email: "test@test.com", password: "123" };
    await authController.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it("deve chamar authService.registerPatient", async () => {
    const dto = { name: "Test", email: "test@test.com", password: "123" };
    await authController.register(dto);
    expect(authService.registerPatient).toHaveBeenCalledWith(dto);
  });
});
