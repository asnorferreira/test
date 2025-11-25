import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SuggestionPayloadDto {
  @ApiProperty({
    description: 'ID da conversa para a qual a sugestão se destina.',
    example: 'whatsapp:1234567890',
  })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    description: 'Payload contendo a análise e sugestões da IA.',
    example: {
      checklistStatus: { GREETING: 'completed', CONFIRMATION: 'pending' },
      suggestions: ['Sugestão 1', 'Sugestão 2'],
      alert: null,
    },
  })
  @IsObject()
  payload: any;
}