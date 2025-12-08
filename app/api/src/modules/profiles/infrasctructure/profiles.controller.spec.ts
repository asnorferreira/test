import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { GetCandidateProfileUseCase } from '../application/use-cases/get-candidate-profile.use-case';
import { UpdateCandidateProfileUseCase } from '../application/use-cases/update-candidate-profile.use-case';
import { UpdateProfileDto } from '../presentation/dtos/update-profile.dto';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  
  const mockGetUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: GetCandidateProfileUseCase, useValue: mockGetUseCase },
        { provide: UpdateCandidateProfileUseCase, useValue: mockUpdateUseCase },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('deve obter o perfil do candidato logado', async () => {
    const userId = 'user-123';
    const profile = { userId, nomeCompleto: 'João' };
    mockGetUseCase.execute.mockResolvedValue(profile);

    const result = await controller.getMyProfile(userId);

    expect(mockGetUseCase.execute).toHaveBeenCalledWith(userId);
    expect(result).toEqual(profile);
  });

  it('deve atualizar o perfil do candidato', async () => {
    const userId = 'user-123';
    const dto: UpdateProfileDto = { nomeCompleto: 'João Silva', cidade: 'Recife' };
    const updatedProfile = { userId, ...dto };
    mockUpdateUseCase.execute.mockResolvedValue(updatedProfile);

    const result = await controller.updateMyProfile(userId, dto);

    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(userId, dto);
    expect(result).toEqual(updatedProfile);
  });
});