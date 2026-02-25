import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AnswerDto {
  @ApiProperty({ example: "sintomas_principais" })
  @IsString()
  @IsNotEmpty()
  questionKey!: string;

  @ApiProperty({ example: "Dor intensa ao amamentar" })
  @IsNotEmpty()
  answerValue!: any;
}

export class SubmitQuestionnaireDto {
  @ApiProperty({
    type: [AnswerDto],
    description: "Lista de respostas do paciente",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
