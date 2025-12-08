import { Test, TestingModule } from '@nestjs/testing';
import { TalentPoolRhController } from './talent-pool-rh.controller';
import { GetTalentPoolUseCase } from '../application/use-cases/get-talent-pool.use-case';
import { GetSubmissionDetailsUseCase } from '../application/use-cases/get-submission-details.use-case';
import { UpdateSubmissionStatusUseCase } from '../application/use-cases/update-submission-status.use-case';
import { ExportSubmissionsUseCase } from '../application/use-cases/export-submissions.use-case';
import { GetTalentPoolQueryDto } from '../presentation/dtos/get-talent-pool-query.dto';
import { UpdateStatusDto } from '../presentation/dtos/update-status.dto';
import { ExportTalentDto } from '../presentation/dtos/export-talent.dto';
import { SubmissionStatus } from '@prisma/client';
import { Response } from 'express';
import { Readable } from 'stream';

describe('TalentPoolRhController', () => {
  let controller: TalentPoolRhController;
  
  const mockGetTalentPoolUseCase = { execute: jest.fn() };
  const mockGetDetailsUseCase = { execute: jest.fn() };
  const mockUpdateStatusUseCase = { execute: jest.fn() };
  const mockExportUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TalentPoolRhController],
      providers: [
        { provide: GetTalentPoolUseCase, useValue: mockGetTalentPoolUseCase },
        { provide: GetSubmissionDetailsUseCase, useValue: mockGetDetailsUseCase },
        { provide: UpdateSubmissionStatusUseCase, useValue: mockUpdateStatusUseCase },
        { provide: ExportSubmissionsUseCase, useValue: mockExportUseCase },
      ],
    }).compile();

    controller = module.get<TalentPoolRhController>(TalentPoolRhController);
  });

  it('deve listar candidatos com filtros (RH)', async () => {
    const query: GetTalentPoolQueryDto = { page: 1, limit: 10 };
    const resultMock = { data: [], meta: {} };
    mockGetTalentPoolUseCase.execute.mockResolvedValue(resultMock);

    const result = await controller.getTalentPool(query);
    expect(mockGetTalentPoolUseCase.execute).toHaveBeenCalledWith(query);
    expect(result).toEqual(resultMock);
  });

  it('deve obter detalhes de uma submissão', async () => {
    const id = 'sub-1';
    const detail = { id, nome: 'Candidato' };
    mockGetDetailsUseCase.execute.mockResolvedValue(detail);

    const result = await controller.getSubmissionDetails(id);
    expect(mockGetDetailsUseCase.execute).toHaveBeenCalledWith(id);
    expect(result).toEqual(detail);
  });

  it('deve atualizar status de uma submissão', async () => {
    const id = 'sub-1';
    const dto: UpdateStatusDto = { status: SubmissionStatus.ENTREVISTA };
    const actor = { sub: 'rh-user' };
    
    mockUpdateStatusUseCase.execute.mockResolvedValue({ id, ...dto });

    const result = await controller.updateSubmissionStatus(id, dto);
    expect(mockUpdateStatusUseCase.execute).toHaveBeenCalled(); 
    expect(result).toHaveProperty('status', SubmissionStatus.ENTREVISTA);
  });

  it('deve exportar dados (Stream)', async () => {
    const dto: ExportTalentDto = { includeData: true, includePdfs: false };
    
    const mockStream = new Readable();
    mockStream.push('csv-content');
    mockStream.push(null);

    const exportResult = { 
      stream: mockStream, 
      filename: 'export.csv', 
      contentType: 'text/csv' 
    };
    mockExportUseCase.execute.mockResolvedValue(exportResult);
    
    const res = {
      set: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;

    await controller.exportSubmissions(dto, res);

    expect(mockExportUseCase.execute).toHaveBeenCalledWith(dto);
    try {
        expect(res.set).toHaveBeenCalled();
    } catch {
        expect(res.setHeader).toHaveBeenCalled();
    }
  });
});