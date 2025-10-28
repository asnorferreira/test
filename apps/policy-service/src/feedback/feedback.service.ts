import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src/prisma.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { UpdateFeedbackDto } from './dtos/update-feedback.dto';

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

  findAll() {
    return this.prisma.suggestionFeedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const feedback = await this.prisma.suggestionFeedback.findUnique({ where: { id } });
    if (!feedback) {
      throw new NotFoundException(`Feedback com ID "${id}" não encontrado.`);
    }
    return feedback;
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    try {
      return await this.prisma.suggestionFeedback.update({
        where: { id },
        data: updateFeedbackDto,
      });
    } catch (error) {
      throw new NotFoundException(`Feedback com ID "${id}" não encontrado.`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.suggestionFeedback.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Feedback com ID "${id}" não encontrado.`);
    }
  }
}
