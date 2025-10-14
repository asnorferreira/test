import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

class MetadataDto {
  @ApiProperty({
    example: 'whatsapp:123456789',
    description: 'ID único da conversa no canal de origem.',
  })
  @IsString()
  conversationId: string;

  @ApiProperty({
    example: 'whatsapp',
    description: 'Canal de origem do evento (ex: "whatsapp", "voice", "chat").',
  })
  @IsString()
  channel: string;

  @ApiProperty({
    required: false,
    description: 'URL opcional para resposta assíncrona (callback/webhook de retorno).',
    example: 'http://localhost:5678/webhook/test/abc123'
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  returnUrl?: string;
}

export class WebhookEventDto {
  @ApiProperty({
    example: 'cliente',
    description: 'Autor da mensagem ("cliente" ou "atendente").',
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    example: 'Olá, gostaria de saber mais sobre meu débito.',
    description: 'Conteúdo da mensagem ou transcrição da fala.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: '2025-10-07T14:30:00.000Z',
    description: 'Timestamp do evento no formato ISO 8601.',
  })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({ description: 'Metadados associados ao evento.' })
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;
}