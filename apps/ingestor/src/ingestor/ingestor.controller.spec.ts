import { Test, TestingModule } from '@nestjs/testing';
import { IngestorController } from './ingestor.controller';
import { IngestorService } from './ingestor.service';
import { WebhookEventDto } from './dto/webhook-event.dto';

const mockIngestorService = {
  processEvent: jest.fn(),
};

describe('IngestorController', () => {
  let ingestorController: IngestorController;
  let ingestorService: IngestorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestorController],
      providers: [
        {
          provide: IngestorService,
          useValue: mockIngestorService,
        },
      ],
    }).compile();

    ingestorController = module.get<IngestorController>(IngestorController);
    ingestorService = module.get<IngestorService>(IngestorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(ingestorController).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should call IngestorService.processEvent with the correct payload and return status', () => {
      const webhookEventDto: WebhookEventDto = {
        author: 'cliente',
        text: 'Olá, gostaria de negociar meu débito.',
        timestamp: new Date(),
        metadata: {
          conversationId: 'whatsapp:123456',
          channel: 'whatsapp',
        },
      };

      const result = ingestorController.handleWebhook(webhookEventDto);

      expect(ingestorService.processEvent).toHaveBeenCalledTimes(1);
      expect(ingestorService.processEvent).toHaveBeenCalledWith(webhookEventDto);

      expect(result).toEqual({ status: 'event received' });
    });
  });
});