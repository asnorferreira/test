import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

class MetadataDto {
    @IsString()
    conversationId: string;

    @IsString()
    channel: string; // 'whatsapp', 'voice', 'chat'
}

export class WebhookEventDto {
  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;
}