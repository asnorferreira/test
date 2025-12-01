import { Test, TestingModule } from '@nestjs/testing';
import { RegisterCandidateUseCase } from './register-candidate.use-case';
import { IIamRepository } from '../ports/i-iam.repository';
import { IHashingService } from '../../domain/services/i-hashing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterCandidateDto } from '../../presentation/dtos/register-candidate.dto';
import { ConflictException } from '@nestjs/common';
import { AuthEvents } from '../../domain/constants/auth-events.constants';
import { User } from '@prisma/client';
import { UserRole } from '@jsp/shared';

const mockIamRepository = {
  findUserByEmail: jest.fn(),
  registerCandidate: jest.fn(),
  createVerificationToken: jest.fn(),
};

const mockHashingService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockCandidateDto: RegisterCandidateDto = {
  fullName: 'Candidato Teste',
  email: 'teste@email.com',
  password: 'password123',
  confirmPassword: 'password123',
};

const mockUser: User = {
  id: 'user-uuid',
  email: 'teste@email.com',
  fullName: 'Candidato Teste',
  passwordHash: 'hashed_password',
  role: UserRole.CANDIDATE,
  isActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RegisterCandidateUseCase', () => {
  let useCase: RegisterCandidateUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterCandidateUseCase,
        { provide: IIamRepository, useValue: mockIamRepository },
        { provide: IHashingService, useValue: mockHashingService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<RegisterCandidateUseCase>(RegisterCandidateUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // Teste da Regra de Negócio 1: Registro bem-sucedido
  it('should register a new candidate successfully', async () => {
    mockIamRepository.findUserByEmail.mockResolvedValue(null);
    // 2. Simula o hashing da senha
    mockHashingService.hash.mockResolvedValue('hashed_password');
    // 3. Simula a criação do usuário
    mockIamRepository.registerCandidate.mockResolvedValue(mockUser);
    // 4. Simula a criação do token
    mockIamRepository.createVerificationToken.mockResolvedValue('fake-token');

    // Act (Execução)
    const result = await useCase.execute(mockCandidateDto);

    // Assert (Verificação)
    expect(result.message).toContain('Cadastro realizado');
    // Verifica se o repositório foi chamado com o e-mail correto
    expect(mockIamRepository.findUserByEmail).toHaveBeenCalledWith(
      mockCandidateDto.email.toLowerCase(),
    );
    // Verifica se o hashing foi chamado com a senha correta
    expect(mockHashingService.hash).toHaveBeenCalledWith(
      mockCandidateDto.password,
    );
    // Verifica se o registro foi chamado com os dados corretos
    expect(mockIamRepository.registerCandidate).toHaveBeenCalledWith(
      mockCandidateDto,
      'hashed_password',
    );
    // Verifica se o evento de domínio foi emitido
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      AuthEvents.USER_REGISTERED,
      {
        email: mockUser.email,
        fullName: mockUser.fullName,
      },
    );
  });

  // Teste da Regra de Negócio 2: E-mail já existe
  it('should throw a ConflictException if email is already in use', async () => {
    mockIamRepository.findUserByEmail.mockResolvedValue(mockUser);
    await expect(useCase.execute(mockCandidateDto)).rejects.toThrow(
      ConflictException,
    );

    expect(mockHashingService.hash).not.toHaveBeenCalled();
    expect(mockIamRepository.registerCandidate).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});