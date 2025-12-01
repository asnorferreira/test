import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCandidateProfileUseCase } from './update-candidate-profile.use-case';
import { IProfilesRepository } from '../ports/i-profiles.repository';
import { UpdateProfileDto } from '../../presentation/dtos/update-profile.dto';

const mockProfilesRepo = {
  findByUserId: jest.fn(),
  upsert: jest.fn(),
};

const mockUserId = 'user-uuid-123';
const mockDto: UpdateProfileDto = {
  nomeCompleto: 'Nome Atualizado',
  telefone: '81911112222',
  cidade: 'Olinda - PE',
  linkedinUrl: 'linkedin.com/in/teste-novo',
};

describe('UpdateCandidateProfileUseCase', () => {
  let useCase: UpdateCandidateProfileUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCandidateProfileUseCase,
        { provide: IProfilesRepository, useValue: mockProfilesRepo },
      ],
    }).compile();

    useCase = module.get<UpdateCandidateProfileUseCase>(
      UpdateCandidateProfileUseCase,
    );
  });

  // Teste Regra 1: Deve chamar 'upsert' com os dados corretos
  it('should call the repository upsert method with correct data', async () => {
    const mockUpdatedProfile = {
      id: 'profile-uuid-456',
      userId: mockUserId,
      ...mockDto,
      updatedAt: new Date(),
    };
    mockProfilesRepo.upsert.mockResolvedValue(mockUpdatedProfile);
    const result = await useCase.execute(mockUserId, mockDto);

    expect(result).toEqual(mockUpdatedProfile);
    // Valida que o 'upsert' foi chamado com o DTO e o UserID corretos
    expect(mockProfilesRepo.upsert).toHaveBeenCalledWith(mockUserId, mockDto);
    expect(mockProfilesRepo.upsert).toHaveBeenCalledTimes(1);
  });
});