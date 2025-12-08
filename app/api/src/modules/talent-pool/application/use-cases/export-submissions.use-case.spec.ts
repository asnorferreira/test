import { Test, TestingModule } from '@nestjs/testing';
import { ExportSubmissionsUseCase } from './export-submissions.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { IStorageService } from '@/core/storage/i-storage.service';
import { BadRequestException } from '@nestjs/common';
import { ExportTalentDto } from '../../presentation/dtos/export-talent.dto';
import { TalentPoolSubmission } from '@prisma/client';
import archiver from 'archiver';

// (CORREÇÃO 1) Mock robusto do 'fast-csv'
// Ajustado para disparar APENAS 'finish' por padrão, eliminando o erro falso de CSV
jest.mock('fast-csv', () => {
  const mockCsvStream = {
    on: jest.fn().mockImplementation(function (this: any, event: string, cb: (...args: any[]) => void) {
        // Só dispara o término com sucesso, não dispara erro
        if (event === 'finish') {
           cb(); 
        }
        return this;
    }),
    emit: jest.fn(),
    end: jest.fn(),
    pipe: jest.fn(),
  };

  return {
    format: jest.fn(() => mockCsvStream),
    writeToStream: jest.fn(() => mockCsvStream),
  };
});

// Mock do 'archiver'
const mockArchiverInstance = {
  on: jest.fn().mockReturnThis(),
  append: jest.fn().mockReturnThis(),
  finalize: jest.fn().mockReturnThis(),
  pipe: jest.fn(),
};

jest.mock('archiver', () => {
  const mockArchiver = jest.fn(() => mockArchiverInstance);
  (mockArchiver as any).create = jest.fn(() => mockArchiverInstance);
  return mockArchiver;
});

// Mocks dos Serviços
const mockTalentPoolRepo = {
  findSubmissionsByIds: jest.fn(),
  findAllSubmissionsByFilter: jest.fn(),
};
const mockStorageService = {
  downloadFileStream: jest.fn(),
  upload: jest.fn(),
};

// Import mocks para asserções
const mockedArchiver = archiver as unknown as jest.Mock;
const mockedFastCsv = require('fast-csv');

describe('ExportSubmissionsUseCase', () => {
  let useCase: ExportSubmissionsUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportSubmissionsUseCase,
        { provide: ITalentPoolRepository, useValue: mockTalentPoolRepo },
        { provide: IStorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<ExportSubmissionsUseCase>(ExportSubmissionsUseCase);
    mockedArchiver.mockReturnValue(mockArchiverInstance);
  });

  // Teste Regra 1: Falha se nenhuma opção de exportação for selecionada
  it('should throw BadRequestException if no include option is true', async () => {
    const dto: ExportTalentDto = {
      includeData: false,
      includePdfs: false,
    };
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  // Teste Regra 2: Deve gerar APENAS CSV
  it('should return a CSV stream if only includeData is true', async () => {
    const dto: ExportTalentDto = { includeData: true, includePdfs: false };
    
    const mockSubmission: Partial<TalentPoolSubmission> = {
      cvUrl: 'http://supabase.com/cv.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
      submissionId: '123',
      nomeCompleto: 'Teste CSV',
      email: 'teste@email.com',
    };
    
    mockTalentPoolRepo.findAllSubmissionsByFilter.mockResolvedValue([
      mockSubmission as TalentPoolSubmission,
    ]);

    const result = await useCase.execute(dto);

    expect(result.contentType).toBe('text/csv');
    expect(result.filename).toContain('.csv');
    expect(mockedFastCsv.format).toHaveBeenCalled();
    expect(mockedArchiver).not.toHaveBeenCalled();
  });

  // Teste Regra 3: Deve gerar APENAS ZIP (só PDFs)
  it('should return a ZIP stream if only includePdfs is true', async () => {
    const dto: ExportTalentDto = { includeData: false, includePdfs: true };
    
    // (CORREÇÃO 2) Adicionado 'nomeCompleto' para evitar erro no .replace()
    const mockSubmission: Partial<TalentPoolSubmission> = {
        cvUrl: 'http://supabase.com/cv.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        submissionId: '123',
        nomeCompleto: 'Teste ZIP', // Campo obrigatório para o nome do arquivo
    };

    mockTalentPoolRepo.findAllSubmissionsByFilter.mockResolvedValue([
        mockSubmission as TalentPoolSubmission
    ]);
    
    mockStorageService.downloadFileStream.mockResolvedValue(
      'mock-stream' as any,
    );

    const result = await useCase.execute(dto);

    expect(result.contentType).toBe('application/zip');
    expect(result.filename).toContain('.zip');
    expect(mockedArchiver).toHaveBeenCalledWith('zip', expect.anything());
    expect(mockedFastCsv.format).not.toHaveBeenCalled();
  });

  // Teste Regra 4: Deve gerar ZIP com CSV e PDFs
  it('should return a ZIP stream with CSV and PDFs if both are true', async () => {
    const dto: ExportTalentDto = { includeData: true, includePdfs: true };
    
    const mockSubmission: Partial<TalentPoolSubmission> = {
      cvUrl: 'http://supabase.com/cv.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
      submissionId: '123',
      nomeCompleto: 'Teste Completo',
      email: 'teste@email.com',
    };
    
    mockTalentPoolRepo.findAllSubmissionsByFilter.mockResolvedValue([
      mockSubmission as TalentPoolSubmission,
    ]);
    mockStorageService.downloadFileStream.mockResolvedValue(
      'mock-pdf-stream' as any,
    );

    const result = await useCase.execute(dto);
    
    expect(result.contentType).toBe('application/zip');
    expect(mockedArchiver).toHaveBeenCalled();
    expect(mockedFastCsv.format).toHaveBeenCalled(); 
    expect(mockStorageService.downloadFileStream).toHaveBeenCalled(); 
    
    expect(mockArchiverInstance.append).toHaveBeenCalled(); 
    expect(mockArchiverInstance.finalize).toHaveBeenCalled();
  });
});