import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateScriptDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}