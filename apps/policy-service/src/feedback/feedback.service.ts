import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: string, tenantId: string) {
    const suggestion = await this.prisma.aISuggestion.findUnique({
      where: { id: createFeedbackDto.suggestionId },
      include: { event: { include: { conversation: true } } },
    });

    if (!suggestion || suggestion.event.conversation.tenantId !== tenantId) {
      throw new UnauthorizedException('Você não tem permissão para avaliar esta sugestão.');
    }

    return this.prisma.suggestionFeedback.create({
      data: {
        suggestionId: createFeedbackDto.suggestionId,
        rating: createFeedbackDto.rating,
        comment: createFeedbackDto.comment,
        userId: userId,
      },
    });
  }
}
