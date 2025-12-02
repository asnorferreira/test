import { Test, TestingModule } from '@nestjs/testing';
import { UpdateSubmissionStatusUseCase } from './update-submission-status.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IIamRepository } from '@/modules/iam/application/ports/i-iam.repository';
import { UpdateStatusDto } from '../../presentation/dtos/update-status.dto';
import { SubmissionStatus, TalentPoolSubmission } from '@prisma/client';
import { TalentPoolEvents } from '../../domain/talent-pool-events.constants';

// Mocks
const mockTalentPoolRepo = {
  updateStatus: jest.fn(),
};
const mockIamRepo = {}; // Não é usado diretamente neste UC, mas precisa estar no provider
const mockEventEmitter = {
  emit: jest.fn(),
};

// Mock de dados
const mockSubmission: Partial<TalentPoolSubmission> = {
  id: 'sub-uuid-123',
  email: 'candidato@email.com',
  nomeCompleto: 'Candidato Teste',
};

describe('UpdateSubmissionStatusUseCase', () => {
  let useCase: UpdateSubmissionStatusUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSubmissionStatusUseCase,
        { provide: ITalentPoolRepository, useValue: mockTalentPoolRepo },
        { provide: IIamRepository, useValue: mockIamRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();
    useCase = module.get<UpdateSubmissionStatusUseCase>(
      UpdateSubmissionStatusUseCase,
    );
  });

  // Teste Regra 1: Deve emitir APENAS 1 evento (STATUS_UPDATED) se o status NÃO for CONTRATADO
  it('should emit only STATUS_UPDATED event if status is not CONTRATADO', async () => {
    // Arrange
    const dto: UpdateStatusDto = { status: SubmissionStatus.REPROVADO };
    const updatedSubmission = {
      ...mockSubmission,
      status: SubmissionStatus.REPROVADO,
    };
    mockTalentPoolRepo.updateStatus.mockResolvedValue(updatedSubmission);

    // Act
    await useCase.execute('sub-uuid-123', dto);

    // Assert
    // Deve ser chamado 1 vez
    expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
    // Deve ser chamado com o evento correto
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      TalentPoolEvents.STATUS_UPDATED,
      {
        candidateEmail: updatedSubmission.email,
        newStatus: updatedSubmission.status,
      },
    );
    // NÃO deve emitir o evento de contratação
    expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
      TalentPoolEvents.CANDIDATE_HIRED,
      expect.anything(),
    );
  });

  // Teste Regra 2: Deve emitir 2 eventos (STATUS_UPDATED e CANDIDATE_HIRED) se o status for CONTRATADO
  it('should emit both events if status is CONTRATADO', async () => {
    // Arrange
    const dto: UpdateStatusDto = { status: SubmissionStatus.CONTRATADO };
    const updatedSubmission = {
      ...mockSubmission,
      status: SubmissionStatus.CONTRATADO,
    };
    mockTalentPoolRepo.updateStatus.mockResolvedValue(updatedSubmission);

    // Act
    await useCase.execute('sub-uuid-123', dto);

    // Assert
    // Deve ser chamado 2 vezes
    expect(mockEventEmitter.emit).toHaveBeenCalledTimes(2);
    // Deve emitir o STATUS_UPDATED
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      TalentPoolEvents.STATUS_UPDATED,
      {
        candidateEmail: updatedSubmission.email,
        newStatus: updatedSubmission.status,
      },
    );
    // Deve TAMBÉM emitir o CANDIDATE_HIRED
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      TalentPoolEvents.CANDIDATE_HIRED,
      {
        candidateName: updatedSubmission.nomeCompleto,
      },
    );
  });
});