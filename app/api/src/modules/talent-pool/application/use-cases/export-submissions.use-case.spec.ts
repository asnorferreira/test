import { Test, TestingModule } from '@nestjs/testing';
import { ExportSubmissionsUseCase } from './export-submissions.use-case';
import { ITalentPoolRepository } from '../ports/i-talent-pool.repository';
import { IStorageService } from '@/core/storage/i-storage.service';
import { BadRequestException } from '@nestjs/common';
import { ExportTalentDto } from '../../presentation/dtos/export-talent.dto';
import { TalentPoolSubmission } from '@prisma/client';
import archiver from 'archiver';

// (CORREÇÃO 1) Mock robusto do 'fast-csv'
jest.mock('fast-csv', () => {
  // Criamos uma instância de mock reutilizável para o stream
  type MockCsvStream = {
    on: jest.MockedFunction<(event: string, cb: (...args: any[]) => void) => MockCsvStream>;
    emit: jest.Mock;
    end: jest.Mock;
    pipe: jest.Mock;
  };
  const mockCsvStream = {
    on: jest.fn((event: string, cb: (...args: any[]) => void) => {
        if (event === 'finish' || event === 'error') {
        cb(null);
        }
        return mockCsvStream as any; // precisa disso pra quebrar o ciclo de inferência
    }),
    emit: jest.fn(),
    end: jest.fn(),
    pipe: jest.fn(),
  } as unknown as MockCsvStream;

  return {
    format: jest.fn(() => mockCsvStream),
    writeToStream: jest.fn(() => mockCsvStream), // writeToStream retorna o stream
  };
});

// Mock robusto do 'archiver'
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
  upload: jest.fn(), // Adicionado para satisfazer a interface
};

// Import mocks
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
    // Arrange
    const dto: ExportTalentDto = {
      includeData: false,
      includePdfs: false,
    };
    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  // Teste Regra 2: Deve gerar APENAS CSV
  it('should return a CSV stream if only includeData is true', async () => {
    // Arrange
    const dto: ExportTalentDto = { includeData: true, includePdfs: false };
    // (CORREÇÃO 2) Mock de dados com datas
    const mockSubmission: Partial<TalentPoolSubmission> = {
      cvUrl: 'http://supabase.com/cv.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTalentPoolRepo.findAllSubmissionsByFilter.mockResolvedValue([
      mockSubmission as TalentPoolSubmission,
    ]);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.contentType).toBe('text/csv');
    expect(result.filename).toContain('.csv');
    expect(mockedFastCsv.format).toHaveBeenCalled();
    expect(mockedArchiver).not.toHaveBeenCalled(); // Não deve chamar o ZIP
  });

  // Teste Regra 3: Deve gerar APENAS ZIP (só PDFs)
  it('should return a ZIP stream if only includePdfs is true', async () => {
    // Arrange
    const dto: ExportTalentDto = { includeData: false, includePdfs: true };
    mockTalentPoolRepo.findAllSubmissionsByFilter.mockResolvedValue([]);
    mockStorageService.downloadFileStream.mockResolvedValue(
      'mock-stream' as any,
    );

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.contentType).toBe('application/zip');
    expect(result.filename).toContain('.zip');
    expect(mockedArchiver).toHaveBeenCalledWith('zip', expect.anything());
    expect(mockedFastCsv.format).not.toHaveBeenCalled(); // Não deve chamar o CSV
  });

  // Teste Regra 4: Deve gerar ZIP com CSV e PDFs
  it('should return a ZIP stream with CSV and PDFs if both are true', async () => {
    // Arrange
    const dto: ExportTalentDto = { includeData: true, includePdfs: true };
    // (CORREÇÃO 2) Mock de dados com datas
    const mockSubmission: Partial<TalentPoolSubmission> = {
      cvUrl: 'http://supabase.com/cv.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTalentPoolRepo.findAllSubmissionsByFilter.mockResolvedValue([
      mockSubmission as TalentPoolSubmission,
    ]);
    mockStorageService.downloadFileStream.mockResolvedValue(
      'mock-pdf-stream' as any,
    );

    // Act
    const result = await useCase.execute(dto);
    const archiveInstance = mockedArchiver();

    // Assert
    expect(result.contentType).toBe('application/zip');
    expect(mockedArchiver).toHaveBeenCalled();
    expect(mockedFastCsv.format).toHaveBeenCalled(); // Chamou o CSV
    expect(mockStorageService.downloadFileStream).toHaveBeenCalled(); // Chamou o PDF
    // Verificamos se o 'append' foi chamado 2x (1 pro CSV, 1 pro PDF)
    expect(archiveInstance.append).toHaveBeenCalledTimes(2);
    expect(archiveInstance.finalize).toHaveBeenCalled();
  });
});