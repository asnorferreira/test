import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'O novo status para a submissão',
    enum: SubmissionStatus,
    example: SubmissionStatus.EM_ANALISE,
  })
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  @IsEnum(SubmissionStatus, {
    message: `O status deve ser um dos seguintes: ${Object.values(
      SubmissionStatus,
    ).join(', ')}`,
  })
  status!: SubmissionStatus;
}