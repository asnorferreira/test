import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { SendContactMessageUseCase } from '../application/use-cases/send-contact-message.use-case';
import { CreateContactDto } from '../presentation/dtos/create-contact.dto';

describe('ContactController', () => {
  let controller: ContactController;
  let useCase: SendContactMessageUseCase;

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        { provide: SendContactMessageUseCase, useValue: mockUseCase },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    useCase = module.get<SendContactMessageUseCase>(SendContactMessageUseCase);
  });

  it('deve enviar uma mensagem de contato', async () => {
    const dto: CreateContactDto = {
      fullName: 'Visitante',
      email: 'visitante@email.com',
      phone: '11999999999',
      message: 'Dúvida sobre serviços',
    };

    const expectedResult = { success: true, message: 'Enviado', protocol: 'msg-1' };
    mockUseCase.execute.mockResolvedValue(expectedResult);

    const result = await controller.sendMessage(dto);

    expect(useCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});