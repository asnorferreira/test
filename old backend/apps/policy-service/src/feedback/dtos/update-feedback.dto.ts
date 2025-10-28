import { ApiPropertyOptional } from '@nestjs/swagger';
import { SuggestionRating } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ description: 'A avaliação dada à sugestão.', enum: SuggestionRating })
  @IsOptional()
  @IsEnum(SuggestionRating)
  rating?: SuggestionRating;

  @ApiPropertyOptional({ description: 'Comentário opcional explicando a avaliação.' })
  @IsOptional()
  @IsString()
  comment?: string;
}