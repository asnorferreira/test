import { Test, TestingModule } from '@nestjs/testing';
import { SendContactMessageUseCase } from './send-contact-message.use-case';
import { ContactRepository } from '../../infrastructure/adapters/contact.repository';
import { IEmailService } from '@/core/email/i-email.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from '../../presentation/dtos/create-contact.dto';

describe('SendContactMessageUseCase', () => {
  let useCase: SendContactMessageUseCase;
  let contactRepo: ContactRepository;
  let emailService: IEmailService;

  const mockContactRepo = {
    create: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'SAC_EMAIL') return 'sac@teste.com';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendContactMessageUseCase,
        { provide: ContactRepository, useValue: mockContactRepo },
        { provide: IEmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<SendContactMessageUseCase>(SendContactMessageUseCase);
    contactRepo = module.get<ContactRepository>(ContactRepository);
    emailService = module.get<IEmailService>(IEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve salvar a mensagem e enviar e-mail com sucesso', async () => {
    const dto: CreateContactDto = {
      fullName: 'Cliente Teste',
      email: 'cliente@email.com',
      phone: '11999999999',
      subject: 'Dúvida',
      message: 'Olá, tenho uma dúvida.',
    };

    const savedMessage = { id: 'msg-123', ...dto, createdAt: new Date() };
    mockContactRepo.create.mockResolvedValue(savedMessage);
    mockEmailService.sendEmail.mockResolvedValue(null);

    const result = await useCase.execute(dto);

    expect(contactRepo.create).toHaveBeenCalledWith(dto);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'sac@teste.com',
        subject: expect.stringContaining('Nova Mensagem'),
      }),
    );
    expect(result).toEqual({
      success: true,
      message: expect.any(String),
      protocol: 'msg-123',
    });
  });

  it('deve lançar InternalServerErrorException se o repositório falhar', async () => {
    const dto: CreateContactDto = {
      fullName: 'Erro',
      email: 'erro@email.com',
      phone: '000',
      message: 'msg',
    };

    mockContactRepo.create.mockRejectedValue(new Error('DB Error'));
    
    // Suprime o log de erro esperado
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(useCase.execute(dto)).rejects.toThrow(
      InternalServerErrorException,
    );

    consoleSpy.mockRestore();
  });
});