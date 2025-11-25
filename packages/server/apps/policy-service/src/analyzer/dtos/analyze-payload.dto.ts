import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AnalyzePayloadDto {
  @ApiProperty({ description: 'ID da conversa que está sendo analisada.' })
  @IsUUID()
  conversationId: string;

  @ApiProperty({ description: 'ID da campanha associada à conversa.' })
  @IsUUID()
  campaignId: string;

  @ApiProperty({ description: 'Conteúdo da última mensagem para análise.' })
  @IsString()
  @IsNotEmpty()
  lastMessage: string;
}
