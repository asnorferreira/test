import { Test, TestingModule } from '@nestjs/testing';
import { IamController } from './iam.controller';
import { RegisterCandidateUseCase } from '../application/use-cases/register-candidate.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { CreateStaffUserUseCase } from '../application/use-cases/create-staff-user.use-case';
import { ConfigService } from '@nestjs/config';
import { RegisterCandidateDto } from '../presentation/dtos/register-candidate.dto';
import { LoginDto } from '../presentation/dtos/login.dto';
import { CreateStaffUserDto } from '../presentation/dtos/create-staff-user.dto';
import { UserRole } from '@jsp/shared';
import type { Response } from 'express';

describe('IamController', () => {
  let controller: IamController;
  let loginUseCase: LoginUseCase;

  const mockRegisterUseCase = { execute: jest.fn() };
  const mockLoginUseCase = { execute: jest.fn() };
  const mockCreateStaffUseCase = { execute: jest.fn() };
  const mockConfigService = { get: jest.fn() };

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IamController],
      providers: [
        { provide: RegisterCandidateUseCase, useValue: mockRegisterUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: CreateStaffUserUseCase, useValue: mockCreateStaffUseCase },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<IamController>(IamController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('deve registrar um candidato com sucesso', async () => {
    const dto: RegisterCandidateDto = {
      fullName: 'Teste',
      email: 'teste@email.com',
      password: 'senha',
      confirmPassword: 'senha',
    };
    mockRegisterUseCase.execute.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.registerCandidate(dto);
    expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id');
  });

  it('deve realizar login e definir cookie', async () => {
    const dto: LoginDto = { email: 'teste@email.com', password: 'senha' };
    const tokens = { accessToken: 'access', refreshToken: 'refresh' };
    mockLoginUseCase.execute.mockResolvedValue(tokens);
    mockConfigService.get.mockReturnValue('production');

    const result = await controller.login(dto, mockResponse);

    expect(mockLoginUseCase.execute).toHaveBeenCalledWith(dto);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh',
      expect.objectContaining({ httpOnly: true, secure: true }),
    );
    expect(result).toEqual({ accessToken: 'access' });
  });

  it('deve criar um usuário staff (RH/Gestor)', async () => {
    const dto: CreateStaffUserDto = {
      fullName: 'Staff',
      email: 'staff@jsp.com',
      role: UserRole.RH,
    };
    const actor = { sub: 'admin-id' };
    mockCreateStaffUseCase.execute.mockResolvedValue({ id: 'staff-1', ...dto });

    const result = await controller.createStaffUser(dto, actor as any);

    expect(mockCreateStaffUseCase.execute).toHaveBeenCalledWith(dto, actor);
    expect(result).toHaveProperty('id', 'staff-1');
  });
});