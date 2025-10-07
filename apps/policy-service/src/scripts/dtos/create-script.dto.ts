import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}