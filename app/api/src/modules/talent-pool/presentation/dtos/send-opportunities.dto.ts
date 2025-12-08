import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class SendOpportunitiesDto {
  @ApiProperty({
    description: "Áreas de interesse a serem consideradas no filtro.",
    type: [String],
    example: ["Administrativo", "Facilities"],
  })
  @IsArray()
  @IsString({ each: true })
  areas!: string[];

  @ApiProperty({
    description:
      "Lista de IDs de Candidatos selecionados (SubmissionId). Se vazio, usa todos os candidatos que atendem às áreas.",
    type: [String],
    required: false,
    example: ["sub-2301", "sub-2292"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  candidateIds?: string[];

  @ApiProperty({
    description:
      "Comentário personalizado do RH/Gestor sobre a vaga (opcional).",
    required: false,
    example: "Vaga urgente em São Paulo, contratação imediata.",
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
