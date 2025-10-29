import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { of, throwError } from 'rxjs';
import { ConversationProcessor } from '@/worker/conversation-processor.service';

const mockHttpService = {
  post: jest.fn(),
};
const mockConfigService = {
  get: jest.fn(),
};

const mockJob = {
  id: 'job-123',
  data: {
    id: 'event-abc',
    author: 'cliente',
    text: 'Olá',
    timestamp: new Date(),
    metadata: { conversationId: 'conv-1', channel: 'whatsapp' },
  },
} as Job;

describe('ConversationProcessor', () => {
  let processor: ConversationProcessor;
  let httpService: HttpService;

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('http://fake-n8n.com/webhook');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationProcessor,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    processor = module.get<ConversationProcessor>(ConversationProcessor);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should call N8N webhook with job data on process', async () => {
    mockHttpService.post.mockReturnValue(of({ status: 200, data: 'ok' }));

    await processor.process(mockJob);

    expect(httpService.post).toHaveBeenCalledTimes(1);
    expect(httpService.post).toHaveBeenCalledWith(
      'http://fake-n8n.com/webhook',
      mockJob.data,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('should throw error if N8N call fails', async () => {
    mockHttpService.post.mockReturnValue(
      throwError(() => ({ message: 'N8N Error', response: { data: { message: 'Failed' } } })),
    );

    await expect(processor.process(mockJob)).rejects.toThrow(
      'Failed to send event event-abc to N8N: Failed',
    );
    expect(httpService.post).toHaveBeenCalledTimes(1);
  });

  it('should skip processing if N8N_WEBHOOK_URL is not configured', async () => {
    mockConfigService.get.mockReturnValue(undefined);
    processor = new ConversationProcessor(httpService, mockConfigService as any);

    const result = await processor.process(mockJob);

    expect(httpService.post).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'skipped', reason: 'N8N_WEBHOOK_URL not configured' });
  });
});
