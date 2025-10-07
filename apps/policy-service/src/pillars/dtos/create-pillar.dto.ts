import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePillarDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID da campanha é obrigatório.' })
  campaignId: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do pilar é obrigatório.' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'O peso deve ser no mínimo 1.' })
  @Max(10, { message: 'O peso deve ser no máximo 10.' })
  weight?: number;
}