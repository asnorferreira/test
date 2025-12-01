import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { IIamRepository } from '../ports/i-iam.repository';
import { IHashingService } from '../../domain/services/i-hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRole } from '@jsp/shared';
import { LoginDto } from '../../presentation/dtos/login.dto';

// Mocks
const mockIamRepository = {
  findUserByEmail: jest.fn(),
};
const mockHashingService = {
  compare: jest.fn(),
};
const mockJwtService = {
  signAsync: jest.fn(),
};
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') return 'secret';
    if (key === 'JWT_EXPIRATION') return '1d';
    if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
    if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
  }),
};

const mockLoginDto: LoginDto = {
  email: 'teste@email.com',
  password: 'password123',
};
const mockUser: User = {
  id: 'user-uuid',
  email: 'teste@email.com',
  fullName: 'Candidato Teste',
  passwordHash: 'hashed_password',
  role: UserRole.CANDIDATE,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: IIamRepository, useValue: mockIamRepository },
        { provide: IHashingService, useValue: mockHashingService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // Teste Regra 1: Login bem-sucedido
  it('should login successfully and return access and refresh tokens', async () => {
    // Arrange
    // 1. Usuário existe
    mockIamRepository.findUserByEmail.mockResolvedValue(mockUser);
    // 2. Senha bate
    mockHashingService.compare.mockResolvedValue(true);
    // 3. JWT Service gera tokens
    mockJwtService.signAsync.mockResolvedValue('fake-token');

    const result = await useCase.execute(mockLoginDto);

    expect(result.accessToken).toBe('fake-token');
    expect(result.refreshToken).toBe('fake-token');
    // Verifica se buscou o usuário
    expect(mockIamRepository.findUserByEmail).toHaveBeenCalledWith(
      mockLoginDto.email,
    );
    // Verifica se comparou a senha
    expect(mockHashingService.compare).toHaveBeenCalledWith(
      mockLoginDto.password,
      mockUser.passwordHash,
    );
    // Verifica se gerou 2 tokens (access e refresh)
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
  });

  // Teste Regra 2: Usuário não encontrado
  it('should throw UnauthorizedException if user is not found', async () => {
    // Arrange
    // 1. Usuário NÃO existe
    mockIamRepository.findUserByEmail.mockResolvedValue(null);
    await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockHashingService.compare).not.toHaveBeenCalled();
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  // Teste Regra 3: Senha incorreta
  it('should throw UnauthorizedException if password does not match', async () => {
    // Arrange
    // 1. Usuário existe
    mockIamRepository.findUserByEmail.mockResolvedValue(mockUser);
    // 2. Senha NÃO bate
    mockHashingService.compare.mockResolvedValue(false);
    await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });
});