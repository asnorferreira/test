import { Test, TestingModule } from '@nestjs/testing';
import { CreateStaffUserUseCase } from './create-staff-user.use-case';
import { IIamRepository } from '../ports/i-iam.repository';
import { IHashingService } from '../../domain/services/i-hashing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@jsp/shared';
import { CreateStaffUserDto } from '../../presentation/dtos/create-staff-user.dto';
import { ActiveUserData } from '../../infrastructure/authentication/strategies/jwt.strategy';
import { AuthEvents } from '../../domain/constants/auth-events.constants';

const mockIamRepository = {
  findUserByEmail: jest.fn(),
  createStaffUser: jest.fn(),
};
const mockHashingService = {
  hash: jest.fn(),
};
const mockEventEmitter = {
  emit: jest.fn(),
};

const adminActor: ActiveUserData = {
  sub: 'admin-uuid',
  email: 'admin@jsp.com',
  role: UserRole.ADMIN,
};
const gestorActor: ActiveUserData = {
  sub: 'gestor-uuid',
  email: 'gestor@jsp.com',
  role: UserRole.GESTOR,
};

const createRhDto: CreateStaffUserDto = {
  fullName: 'Novo RH',
  email: 'rh@jsp.com',
  role: UserRole.RH,
};
const createGestorDto: CreateStaffUserDto = {
  fullName: 'Novo Gestor',
  email: 'gestor2@jsp.com',
  role: UserRole.GESTOR,
};

describe('CreateStaffUserUseCase', () => {
  let useCase: CreateStaffUserUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStaffUserUseCase,
        { provide: IIamRepository, useValue: mockIamRepository },
        { provide: IHashingService, useValue: mockHashingService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();
    useCase = module.get<CreateStaffUserUseCase>(CreateStaffUserUseCase);

    // Configuração padrão de sucesso para os mocks
    mockIamRepository.findUserByEmail.mockResolvedValue(null);
    mockHashingService.hash.mockResolvedValue('hashed_password');
    mockIamRepository.createStaffUser.mockImplementation(async (dto, hash) => ({
      ...dto,
      id: 'new-user-uuid',
      passwordHash: hash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      candidateProfile: null, // Adicionado para conformidade com o tipo Prisma
      submissions: [], // Adicionado para conformidade com o tipo Prisma
    }));
  });

  // Teste Regra 1: Admin pode criar RH
  it('should allow an ADMIN to create an RH user', async () => {
    await useCase.execute(createRhDto, adminActor);

    expect(mockIamRepository.createStaffUser).toHaveBeenCalledWith(
      createRhDto,
      'hashed_password',
    );
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      AuthEvents.STAFF_USER_CREATED,
      expect.anything(), // Já validamos o evento no teste de registro
    );
  });

  // Teste Regra 2: Admin pode criar GESTOR
  it('should allow an ADMIN to create a GESTOR user', async () => {
    await useCase.execute(createGestorDto, adminActor);

    expect(mockIamRepository.createStaffUser).toHaveBeenCalledWith(
      createGestorDto,
      'hashed_password',
    );
    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });

  // Teste Regra 3: Gestor pode criar RH
  it('should allow a GESTOR to create an RH user', async () => {
    await useCase.execute(createRhDto, gestorActor);

    expect(mockIamRepository.createStaffUser).toHaveBeenCalledWith(
      createRhDto,
      'hashed_password',
    );
    expect(mockEventEmitter.emit).toHaveBeenCalled();
  });

  // Teste Regra 4: Gestor NÃO pode criar GESTOR (REGRA DE NEGÓCIO)
  it('should throw ForbiddenException when a GESTOR tries to create another GESTOR', async () => {
    // Act & Assert
    await expect(useCase.execute(createGestorDto, gestorActor)).rejects.toThrow(
      ForbiddenException,
    );

    // Garante que nada foi criado
    expect(mockIamRepository.createStaffUser).not.toHaveBeenCalled();
    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });

  // Teste Regra 5: E-mail duplicado
  it('should throw ConflictException if email is already in use', async () => {
    // Arrange
    mockIamRepository.findUserByEmail.mockResolvedValue({} as any); // Simula usuário existente

    // Act & Assert
    await expect(useCase.execute(createRhDto, adminActor)).rejects.toThrow(
      ConflictException,
    );

    // Garante que nada foi criado
    expect(mockIamRepository.createStaffUser).not.toHaveBeenCalled();
  });
});