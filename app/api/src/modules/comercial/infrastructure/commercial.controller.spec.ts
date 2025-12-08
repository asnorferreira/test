import { Test, TestingModule } from '@nestjs/testing';
import { CommercialController } from './commercial.controller';
import { CreateProposalUseCase } from '../application/use-cases/create-proposal.use-case';
import { CreateProposalDto } from '../presentation/dtos/create-proposal.dto';

describe('CommercialController', () => {
  let controller: CommercialController;
  let useCase: CreateProposalUseCase;

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommercialController],
      providers: [
        { provide: CreateProposalUseCase, useValue: mockUseCase },
      ],
    }).compile();

    controller = module.get<CommercialController>(CommercialController);
    useCase = module.get<CreateProposalUseCase>(CreateProposalUseCase);
  });

  it('deve criar uma proposta comercial', async () => {
    const dto: CreateProposalDto = {
      fullName: 'Empresa X',
      position: 'CEO',
      email: 'contato@empresax.com',
      phone: '11999999999',
      company: 'Empresa X',
      sector: 'TI',
      services: ['Limpeza'],
      estimatedHeadcount: 5,
      needsDescription: 'Limpeza geral',
    };

    const expectedResult = { success: true, message: 'Recebido', protocol: '123' };
    mockUseCase.execute.mockResolvedValue(expectedResult);

    const result = await controller.createProposal(dto);

    expect(useCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});