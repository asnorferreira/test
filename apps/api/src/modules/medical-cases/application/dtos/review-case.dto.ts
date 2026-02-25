import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MedicalReviewStatus } from "@maemais/shared-types";

export class ReviewCaseDto {
  @ApiProperty({ enum: MedicalReviewStatus, description: "Decisão do Médico" })
  @IsEnum(MedicalReviewStatus)
  @IsNotEmpty()
  status!: MedicalReviewStatus;

  @ApiPropertyOptional({ description: "Motivo em caso de recusa" })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: "URL da prescrição em PDF gerada, se houver",
  })
  @IsString()
  @IsOptional()
  prescriptionDocumentUrl?: string;
}
