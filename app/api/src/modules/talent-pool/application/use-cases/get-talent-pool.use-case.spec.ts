import { Test, TestingModule } from '@nestjs/testing';
import { GetTalentPoolUseCase } from './get-talent-pool.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { GetTalentPoolQueryDto } from '../../presentation/dtos/get-talent-pool-query.dto';

const mockTalentPoolRepo = {
  findAllPaginated: jest.fn(),
};

describe('GetTalentPoolUseCase', () => {
  let useCase: GetTalentPoolUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTalentPoolUseCase,
        { provide: ITalentPoolRepository, useValue: mockTalentPoolRepo },
      ],
    }).compile();
    useCase = module.get<GetTalentPoolUseCase>(GetTalentPoolUseCase);
  });

  // Teste Regra 1: Deve chamar paginação com valores padrão
  it('should call repository with default pagination if not provided', async () => {
    // Arrange
    const query: GetTalentPoolQueryDto = {}; // Query vazia
    mockTalentPoolRepo.findAllPaginated.mockResolvedValue({ data: [], meta: {} });

    // Act
    await useCase.execute(query);

    // Assert
    // Valida que os padrões de página 1 e limite 10 foram aplicados
    expect(mockTalentPoolRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  // Teste Regra 2: Deve repassar filtros
  it('should pass filters and pagination to repository', async () => {
    // Arrange
    const query: GetTalentPoolQueryDto = {
      page: 2,
      limit: 50,
      status: 'NOVO' as any,
      search: 'Recife',
    };
    mockTalentPoolRepo.findAllPaginated.mockResolvedValue({ data: [], meta: {} });

    // Act
    await useCase.execute(query);

    // Assert
    expect(mockTalentPoolRepo.findAllPaginated).toHaveBeenCalledWith(query);
  });
});