import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class HelenaChatbotListQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() Name?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() ChannelIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() PublishStatuses?: string[];
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() PageNumber?: number;
  @ApiPropertyOptional({ default: 15 }) @Type(() => Number) @IsInt() @Min(1) @IsOptional() PageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() OrderBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() OrderDirection?: 'ASCENDING' | 'DESCENDING';
}

class HelenaChatbotItemDto {
  id: string;
  key: string;
  name: string;
  type: string;
  channelIds: string[];
  publishStatus: string;
}
export class HelenaChatbotListResponseDto {
  pageNumber: number;
  pageSize: number;
  items: HelenaChatbotItemDto[];
  totalItems: number;
  totalPages: number;
}