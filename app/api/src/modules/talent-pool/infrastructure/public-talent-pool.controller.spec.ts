import { Test, TestingModule } from '@nestjs/testing';
import { PublicTalentPoolController } from './public-talent-pool.controller';
import { PublicJobApplicationUseCase } from '../application/use-cases/public-job-application.use-case';
import { PublicJobApplicationDto } from '../presentation/dtos/public-job-application.dto';
import { BadRequestException } from '@nestjs/common';
import type { FileUpload } from '@/core/storage/i-storage.service';

describe('PublicTalentPoolController', () => {
  let controller: PublicTalentPoolController;
  let useCase: PublicJobApplicationUseCase;

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicTalentPoolController],
      providers: [
        {
          provide: PublicJobApplicationUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<PublicTalentPoolController>(
      PublicTalentPoolController,
    );
    useCase = module.get<PublicJobApplicationUseCase>(
      PublicJobApplicationUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar o use case com DTO e arquivo quando dados forem válidos', async () => {
    const dto: PublicJobApplicationDto = {
      loginEmail: 'candidato@teste.com',
      loginPassword: 'senha',
      fullName: 'Candidato',
      phone: '123',
      jobArea: 'TI',
      contractType: 'CLT',
      workMode: 'Remoto',
      availability: 'Imediata',
      resumeFile: null,
    };

    const mockFile = {
      fieldname: 'resumeFile',
      originalname: 'curriculo.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: Buffer.from('conteudo'),
      size: 1024,
    } as FileUpload;

    const expectedResponse = {
      success: true,
      message: 'Sucesso',
      submissionId: 'sub-1',
    };

    mockUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.publicSubmit(dto, mockFile);

    expect(useCase.execute).toHaveBeenCalledWith(dto, mockFile);
    expect(result).toEqual(expectedResponse);
  });

  it('deve lançar BadRequestException se o arquivo não for enviado', async () => {
    const dto = {} as PublicJobApplicationDto;
    
    // Simula o cenário onde o FileInterceptor/ParseFilePipe falha ou deixa passar null (dependendo da config)
    // No nosso controller, temos uma verificação manual `if (!file)`
    
    await expect(controller.publicSubmit(dto, undefined as any)).rejects.toThrow(
      BadRequestException,
    );
    
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});