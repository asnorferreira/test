import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateNegotiationRuleDto {
  @IsString()
  campaignId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  maxDiscountPercentage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstallments?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minDownPayment?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forbiddenTerms?: string[];
}