import { Test, TestingModule } from '@nestjs/testing';
import { SubmitToTalentPoolUseCase } from './submit-to-talent-pool.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { IProfilesRepository } from '@/modules/profiles/application/ports/i-profiles.repository';
import { IIamRepository } from '@/modules/iam/application/ports/i-iam.repository';
import { IStorageService } from '@/core/storage/i-storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, CandidateProfile, TalentPoolSubmission } from '@prisma/client';
import { UserRole } from '@jsp/shared';
import { SubmitTalentDto } from '../../presentation/dtos/submit-talent.dto';
import { TalentPoolEvents } from '../../domain/talent-pool-events.constants';
import { FileUpload } from '@/core/storage/i-storage.service';

const mockTalentPoolRepo = { createSubmission: jest.fn() };
const mockProfilesRepo = { findByUserId: jest.fn() };
const mockIamRepo = { findById: jest.fn() };
const mockStorageService = { upload: jest.fn(), downloadFileStream: jest.fn() };
const mockEventEmitter = { emit: jest.fn() };
const mockConfigService = { get: jest.fn() };

const mockCandidateId = 'user-uuid-123';
const mockUser: User = {
  id: mockCandidateId,
  email: 'candidato@email.com',
  fullName: 'Candidato Teste',
  passwordHash: 'hash',
  role: UserRole.CANDIDATE,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockProfile: CandidateProfile = {
  id: 'profile-uuid-456',
  userId: mockCandidateId,
  nomeCompleto: 'Candidato Teste Perfil',
  telefone: '81999998888',
  cidade: 'Recife - PE',
  linkedinUrl: 'linkedin.com/in/teste',
  updatedAt: new Date(),
};
const mockDto: SubmitTalentDto = {
  areaDesejada: 'Tecnologia',
  tipoContrato: 'CLT',
  modalidade: 'Híbrido',
  disponibilidade: 'Imediata',
  descricaoVaga: 'Busco desafios',
};
const mockFile: FileUpload = {
  fieldname: 'file',
  originalname: 'cv-teste.pdf',
  buffer: Buffer.from('test'),
} as FileUpload;

describe('SubmitToTalentPoolUseCase', () => {
  let useCase: SubmitToTalentPoolUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_CV_BUCKET') return 'curriculos-teste';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitToTalentPoolUseCase,
        { provide: ITalentPoolRepository, useValue: mockTalentPoolRepo },
        { provide: IProfilesRepository, useValue: mockProfilesRepo },
        { provide: IIamRepository, useValue: mockIamRepo },
        { provide: IStorageService, useValue: mockStorageService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<SubmitToTalentPoolUseCase>(SubmitToTalentPoolUseCase);
  });

  // Teste Regra 1: Fluxo feliz (Snapshot)
  it('should successfully submit and create a snapshot of user and profile data', async () => {
    mockIamRepo.findById.mockResolvedValue(mockUser);
    mockProfilesRepo.findByUserId.mockResolvedValue(mockProfile);
    const mockUploadResult = {
      publicUrl: 'http://supabase.com/cv.pdf',
      path: 'path/cv.pdf',
    };
    mockStorageService.upload.mockResolvedValue(mockUploadResult);
    const mockSubmission = {
      ...mockDto,
      ...mockUploadResult,
      id: 'sub-uuid-789',
    };
    mockTalentPoolRepo.createSubmission.mockResolvedValue(mockSubmission);

    const result = await useCase.execute(mockDto, mockCandidateId, mockFile);

    expect(result.message).toContain('sucesso');
    expect(mockIamRepo.findById).toHaveBeenCalledWith(mockCandidateId);
    expect(mockProfilesRepo.findByUserId).toHaveBeenCalledWith(mockCandidateId);
    expect(mockStorageService.upload).toHaveBeenCalledWith(
      mockFile,
      'curriculos-teste',
      expect.stringContaining(mockCandidateId),
    );
    expect(mockTalentPoolRepo.createSubmission).toHaveBeenCalledWith({
      candidateId: mockUser.id,
      cvUrl: mockUploadResult.publicUrl,
      nomeCompleto: mockProfile.nomeCompleto,
      email: mockUser.email,
      telefone: mockProfile.telefone,
      cidade: mockProfile.cidade,
      linkedinUrl: mockProfile.linkedinUrl,
      ...mockDto,
    });
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      TalentPoolEvents.SUBMISSION_CREATED,
      {
        candidateEmail: mockUser.email,
        candidateName: mockUser.fullName,
      },
    );
  });

  // Teste Regra 2: Falha se o usuário (User) não for encontrado
  it('should throw NotFoundException if user is not found', async () => {
    mockIamRepo.findById.mockResolvedValue(null);
    mockProfilesRepo.findByUserId.mockResolvedValue(mockProfile);

    await expect(
      useCase.execute(mockDto, mockCandidateId, mockFile),
    ).rejects.toThrow(NotFoundException);
    expect(mockStorageService.upload).not.toHaveBeenCalled();
    expect(mockTalentPoolRepo.createSubmission).not.toHaveBeenCalled();
  });

  // Teste Regra 3: Falha se o perfil (Profile) não for encontrado
  it('should throw BadRequestException if profile is not found', async () => {
    mockIamRepo.findById.mockResolvedValue(mockUser);
    mockProfilesRepo.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute(mockDto, mockCandidateId, mockFile),
    ).rejects.toThrow(BadRequestException);
    expect(mockStorageService.upload).not.toHaveBeenCalled();
    expect(mockTalentPoolRepo.createSubmission).not.toHaveBeenCalled();
  });

  // Teste Regra 4: Falha se o bucket não estiver configurado
  it('should throw InternalServerErrorException if bucket is not configured', async () => {
    mockConfigService.get.mockReturnValue(null);

    expect(
      () =>
        new SubmitToTalentPoolUseCase(
          mockTalentPoolRepo as any,
          mockProfilesRepo as any,
          mockIamRepo as any,
          mockStorageService as any,
          mockEventEmitter as any,
          mockConfigService as any,
        ),
    ).toThrow(InternalServerErrorException);
  });
});