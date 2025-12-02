import { Test, TestingModule } from '@nestjs/testing';
import { GetCandidateProfileUseCase } from './get-candidate-profile.use-case';
import { IProfilesRepository } from '../ports/i-profiles.repository';
import { CandidateProfile } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRole } from '@jsp/shared';

const mockProfilesRepo = {
  findByUserId: jest.fn(),
  upsert: jest.fn(),
};

const mockUserId = 'user-uuid-123';
const mockProfile: CandidateProfile = {
  id: 'profile-uuid-456',
  userId: mockUserId,
  nomeCompleto: 'Candidato de Teste',
  telefone: '81999998888',
  cidade: 'Recife - PE',
  linkedinUrl: 'linkedin.com/in/teste',
  updatedAt: new Date(),
};

describe('GetCandidateProfileUseCase', () => {
  let useCase: GetCandidateProfileUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCandidateProfileUseCase,
        { provide: IProfilesRepository, useValue: mockProfilesRepo },
      ],
    }).compile();

    useCase = module.get<GetCandidateProfileUseCase>(
      GetCandidateProfileUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // Teste Regra 1: Deve retornar o perfil se encontrado
  it('should return the candidate profile if found', async () => {
    mockProfilesRepo.findByUserId.mockResolvedValue(mockProfile);
    const result = await useCase.execute(mockUserId);

    expect(result).toEqual(mockProfile);
    expect(mockProfilesRepo.findByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockProfilesRepo.findByUserId).toHaveBeenCalledTimes(1);
  });

  // Teste Regra 2: Deve lançar NotFoundException se o perfil não for encontrado
  it('should throw NotFoundException if profile is not found', async () => {
    mockProfilesRepo.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute(mockUserId)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockProfilesRepo.findByUserId).toHaveBeenCalledWith(mockUserId);
  });
});