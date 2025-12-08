import { Test, TestingModule } from '@nestjs/testing';
import { CreateProposalUseCase } from './create-proposal.use-case';
import { CommercialRepository } from '../../infrastructure/adapters/commercial.repository';
import { IEmailService } from '@/core/email/i-email.service';
import { ConfigService } from '@nestjs/config';
import { CreateProposalDto } from '../../presentation/dtos/create-proposal.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('CreateProposalUseCase', () => {
  let useCase: CreateProposalUseCase;
  let commercialRepo: CommercialRepository;
  let emailService: IEmailService;

  const mockCommercialRepo = {
    create: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('vendas@jsp.com'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProposalUseCase,
        { provide: CommercialRepository, useValue: mockCommercialRepo },
        { provide: IEmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<CreateProposalUseCase>(CreateProposalUseCase);
    commercialRepo = module.get<CommercialRepository>(CommercialRepository);
    emailService = module.get<IEmailService>(IEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma proposta comercial e notificar a equipe', async () => {
    const dto: CreateProposalDto = {
      fullName: 'Gestor B2B',
      position: 'Gerente',
      email: 'b2b@empresa.com',
      phone: '11988887777',
      company: 'Empresa S.A.',
      sector: 'Tecnologia',
      services: ['Limpeza', 'Portaria'],
      estimatedHeadcount: 10,
      needsDescription: 'Preciso de equipe urgente',
    };

    const savedLead = { id: 'lead-uuid', ...dto, createdAt: new Date() };
    mockCommercialRepo.create.mockResolvedValue(savedLead);
    mockEmailService.sendEmail.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(commercialRepo.create).toHaveBeenCalledWith(dto);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'vendas@jsp.com',
        subject: expect.stringContaining(dto.company),
      }),
    );
    expect(result.success).toBe(true);
    expect(result.protocol).toBe('lead-uuid');
  });

  it('deve lidar com erros e lançar exceção apropriada', async () => {
    // IMPORTANTE: Simulamos o erro no repositório
    mockCommercialRepo.create.mockRejectedValue(new Error('Database Timeout'));
    
    // IMPORTANTE: Suprimimos o console.error temporariamente para não poluir o terminal
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const dto = { fullName: 'Teste' } as CreateProposalDto;

    await expect(useCase.execute(dto)).rejects.toThrow(
      InternalServerErrorException,
    );

    consoleSpy.mockRestore();
  });
});