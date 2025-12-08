import { Test, TestingModule } from '@nestjs/testing';
import { PublicJobApplicationUseCase } from './public-job-application.use-case';
import { PrismaService } from '@/core/prisma/prisma.service';
import { IHashingService } from '@/modules/iam/domain/services/i-hashing.service';
import { IStorageService, FileUpload } from '@/core/storage/i-storage.service';
import { ConflictException } from '@nestjs/common';
import { PublicJobApplicationDto } from '../../presentation/dtos/public-job-application.dto';
import { UserRole, SubmissionStatus } from '@prisma/client';

describe('PublicJobApplicationUseCase', () => {
  let useCase: PublicJobApplicationUseCase;
  let prisma: PrismaService;
  let hashingService: IHashingService;
  let storageService: IStorageService;

  // Mock do objeto de transação (tx)
  const mockTx = {
    user: { create: jest.fn() },
    candidateProfile: { create: jest.fn() },
    talentPoolSubmission: { create: jest.fn() },
  };

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockTx)), // Simula a execução da transação
  };

  const mockHashingService = {
    hash: jest.fn(),
  };

  const mockStorageService = {
    upload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicJobApplicationUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: IHashingService, useValue: mockHashingService },
        { provide: IStorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<PublicJobApplicationUseCase>(PublicJobApplicationUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    hashingService = module.get<IHashingService>(IHashingService);
    storageService = module.get<IStorageService>(IStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar a candidatura completa com sucesso', async () => {
    // Arrange
    const dto: PublicJobApplicationDto = {
      loginEmail: 'novo@teste.com',
      loginPassword: 'senhaForte123',
      fullName: 'Candidato Teste',
      phone: '11999999999',
      jobArea: 'TI',
      contractType: 'CLT',
      workMode: 'Remoto',
      availability: 'Imediata',
      resumeFile: null, // Mockado abaixo
    };

    const mockFile = { originalname: 'cv.pdf', buffer: Buffer.from('pdf') } as FileUpload;

    // Mocks Returns
    mockPrisma.user.findUnique.mockResolvedValue(null); // Usuário não existe
    mockHashingService.hash.mockResolvedValue('hashed_password');
    mockStorageService.upload.mockResolvedValue({ publicUrl: 'http://storage/cv.pdf', path: 'resumes/uuid.pdf' });
    
    // Mocks da Transação
    mockTx.user.create.mockResolvedValue({ id: 'user-1', email: dto.loginEmail });
    mockTx.candidateProfile.create.mockResolvedValue({ id: 'profile-1' });
    mockTx.talentPoolSubmission.create.mockResolvedValue({ id: 'submission-1', submissionId: 'sub-code-123' });

    // Act
    const result = await useCase.execute(dto, mockFile);

    // Assert
    // 1. Verificações Prévias
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.loginEmail } });
    expect(hashingService.hash).toHaveBeenCalledWith(dto.loginPassword);
    
    // 2. Upload
    expect(storageService.upload).toHaveBeenCalledWith(
      mockFile, 
      'curriculos', 
      expect.stringMatching(/^resumes\/.*\.pdf$/) // Verifica se gerou UUID e manteve extensão
    );

    // 3. Transação
    expect(prisma.$transaction).toHaveBeenCalled();
    
    // 4. Criação do Usuário (dentro da tx)
    expect(mockTx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: dto.loginEmail,
        passwordHash: 'hashed_password',
        role: UserRole.CANDIDATE,
        isActive: true,
      }),
    });

    // 5. Criação do Perfil (dentro da tx)
    expect(mockTx.candidateProfile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        nomeCompleto: dto.fullName,
      }),
    });

    // 6. Criação da Submissão (dentro da tx)
    expect(mockTx.talentPoolSubmission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        candidateId: 'user-1',
        cvUrl: 'http://storage/cv.pdf',
        status: SubmissionStatus.NOVO,
      }),
    });

    // 7. Retorno
    expect(result).toEqual({
      success: true,
      message: expect.any(String),
      submissionId: 'sub-code-123',
    });
  });

  it('deve lançar ConflictException se o e-mail já estiver cadastrado', async () => {
    // Arrange
    const dto = { loginEmail: 'existente@teste.com' } as PublicJobApplicationDto;
    const mockFile = {} as FileUpload;

    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' }); // Usuário encontrado

    // Act & Assert
    await expect(useCase.execute(dto, mockFile)).rejects.toThrow(ConflictException);

    // Garante que o fluxo parou
    expect(hashingService.hash).not.toHaveBeenCalled();
    expect(storageService.upload).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});