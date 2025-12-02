import { Test, TestingModule } from '@nestjs/testing';
import { GetMySubmissionsUseCase } from './get-my-submissions.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { MySubmissionResponse } from '../../presentation/responses/my-submission.response';
import { SubmissionStatus } from '@prisma/client';

const mockTalentPoolRepo = {
  findByCandidateId: jest.fn(),
};

const mockUserId = 'user-uuid-123';
const mockResponse: MySubmissionResponse[] = [
  {
    id: 'sub1',
    submissionId: 'JSP-1001',
    areaDesejada: 'TI',
    status: SubmissionStatus.NOVO,
    updatedAt: new Date(),
  },
];

describe('GetMySubmissionsUseCase', () => {
  let useCase: GetMySubmissionsUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMySubmissionsUseCase,
        { provide: ITalentPoolRepository, useValue: mockTalentPoolRepo },
      ],
    }).compile();
    useCase = module.get<GetMySubmissionsUseCase>(GetMySubmissionsUseCase);
  });

  // Teste Regra 1: Deve chamar o repositório com o ID correto
  it('should call repository with the correct candidateId', async () => {
    mockTalentPoolRepo.findByCandidateId.mockResolvedValue(mockResponse);

    const result = await useCase.execute(mockUserId);

    expect(result).toEqual(mockResponse);
    expect(mockTalentPoolRepo.findByCandidateId).toHaveBeenCalledWith(
      mockUserId,
    );
  });
});