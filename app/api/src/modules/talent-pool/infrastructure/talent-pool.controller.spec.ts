import { Test, TestingModule } from '@nestjs/testing';
import { TalentPoolController } from './talent-pool.controller';
import { SubmitToTalentPoolUseCase } from '../application/use-cases/submit-to-talent-pool.use-case';
import { GetMySubmissionsUseCase } from '../application/use-cases/get-my-submissions.use-case';
import { PublicJobApplicationUseCase } from '../application/use-cases/public-job-application.use-case';
import { SubmitTalentDto } from '../presentation/dtos/submit-talent.dto';
import { BadRequestException } from '@nestjs/common';
import type { FileUpload } from '@/core/storage/i-storage.service';

describe('TalentPoolController', () => {
  let controller: TalentPoolController;
  let submitUseCase: SubmitToTalentPoolUseCase;
  let getSubmissionsUseCase: GetMySubmissionsUseCase;

  const mockSubmitUseCase = { execute: jest.fn() };
  const mockGetSubmissionsUseCase = { execute: jest.fn() };
  const mockPublicUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TalentPoolController],
      providers: [
        { provide: SubmitToTalentPoolUseCase, useValue: mockSubmitUseCase },
        { provide: GetMySubmissionsUseCase, useValue: mockGetSubmissionsUseCase },
        { provide: PublicJobApplicationUseCase, useValue: mockPublicUseCase },
      ],
    }).compile()

    controller = module.get<TalentPoolController>(TalentPoolController);
    submitUseCase = module.get<SubmitToTalentPoolUseCase>(SubmitToTalentPoolUseCase);
    getSubmissionsUseCase = module.get<GetMySubmissionsUseCase>(GetMySubmissionsUseCase);
  });

  it('deve enviar currículo (rota protegida)', async () => {
    const dto: SubmitTalentDto = {
      areaDesejada: 'TI',
      tipoContrato: 'CLT',
      modalidade: 'Híbrido',
      disponibilidade: 'Imediata',
    };
    const file = { originalname: 'cv.pdf' } as FileUpload;
    const candidateId = 'user-1';

    mockSubmitUseCase.execute.mockResolvedValue({ id: 'sub-1' });

    const result = await controller.submitToTalentPool(dto, candidateId, file);

    expect(mockSubmitUseCase.execute).toHaveBeenCalledWith(dto, candidateId, file);
    expect(result).toEqual({ id: 'sub-1' });
  });

  it('deve lançar erro se arquivo não for enviado na rota protegida', async () => {
     const dto = {} as SubmitTalentDto;
     await expect(controller.submitToTalentPool(dto, 'user-1', undefined as any)).rejects.toThrow(BadRequestException);
     
     expect(mockSubmitUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve listar submissões do candidato', async () => {
    const candidateId = 'user-1';
    const submissions = [{ id: 'sub-1' }];
    mockGetSubmissionsUseCase.execute.mockResolvedValue(submissions);

    const result = await controller.getMySubmissions(candidateId);

    expect(mockGetSubmissionsUseCase.execute).toHaveBeenCalledWith(candidateId);
    expect(result).toEqual(submissions);
  });
});