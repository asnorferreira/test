import { Test, TestingModule } from '@nestjs/testing';
import { PillarsService } from './pillars.service';

describe('PillarsService', () => {
  let service: PillarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PillarsService],
    }).compile();

    service = module.get<PillarsService>(PillarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
