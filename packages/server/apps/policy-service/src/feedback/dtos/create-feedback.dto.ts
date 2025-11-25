import { ApiProperty } from '@nestjs/swagger';
import { SuggestionRating } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'ID da sugestão da IA que está sendo avaliada.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  suggestionId: string;

  @ApiProperty({ description: 'A avaliação dada à sugestão.', enum: SuggestionRating })
  @IsEnum(SuggestionRating)
  @IsNotEmpty()
  rating: SuggestionRating;

  @ApiProperty({ description: 'Comentário opcional explicando a avaliação.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
