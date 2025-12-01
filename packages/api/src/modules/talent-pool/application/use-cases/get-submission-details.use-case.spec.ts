import { Test, TestingModule } from '@nestjs/testing';
import { GetSubmissionDetailsUseCase } from './get-submission-details.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { TalentPoolSubmission } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockTalentPoolRepo = {
  findDetailsById: jest.fn(),
};

const mockSubmission: Partial<TalentPoolSubmission> = {
  id: 'sub-uuid-123',
  nomeCompleto: 'Candidato Detalhe',
};

describe('GetSubmissionDetailsUseCase', () => {
  let useCase: GetSubmissionDetailsUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSubmissionDetailsUseCase,
        { provide: ITalentPoolRepository, useValue: mockTalentPoolRepo },
      ],
    }).compile();
    useCase = module.get<GetSubmissionDetailsUseCase>(
      GetSubmissionDetailsUseCase,
    );
  });

  // Teste Regra 1: Retorna detalhes se encontrado
  it('should return submission details if found', async () => {
    // Arrange
    mockTalentPoolRepo.findDetailsById.mockResolvedValue(mockSubmission);

    // Act
    const result = await useCase.execute('sub-uuid-123');

    // Assert
    expect(result).toEqual(mockSubmission);
    expect(mockTalentPoolRepo.findDetailsById).toHaveBeenCalledWith(
      'sub-uuid-123',
    );
  });

  // Teste Regra 2: Lança NotFound se não encontrado
  it('should throw NotFoundException if submission is not found', async () => {
    // Arrange
    mockTalentPoolRepo.findDetailsById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute('sub-uuid-123')).rejects.toThrow(
      NotFoundException,
    );
  });
});