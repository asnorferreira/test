import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class PublishPolicyResponseDto {
  @ApiProperty({ description: 'ID da política', format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Número da versão da política', example: 1 })
  @IsInt()
  version: number;

  @ApiProperty({ description: 'Indica se a política é a ativa no momento', example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'ID da campanha associada', format: 'uuid', example: 'e2a8c3e8-5b6f-4d2c-8a1a-7b8c9d0e1f2a' })
  @IsUUID()
  campaignId: string;

  @ApiPropertyOptional({ description: 'Email do usuário que publicou a política', example: 'admin@demo.local' })
  @IsOptional()
  @IsString()
  publishedBy?: string | null;

  @ApiProperty({ description: 'Data de criação da política' })
  @Type(() => Date)
  @IsDate()
  createdAt: Date;
}
