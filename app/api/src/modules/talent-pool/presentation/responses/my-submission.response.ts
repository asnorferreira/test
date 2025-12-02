import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';

export class MySubmissionResponse {
  @ApiProperty({ example: 'clv23p4o9000008l4f1y3a9z7' })
  id!: string;
  
  @ApiProperty({ example: 'JSP-2301' })
  submissionId!: string;

  @ApiProperty({ example: 'Administrativo' })
  areaDesejada!: string;

  @ApiProperty({ enum: SubmissionStatus, example: 'NOVO' })
  status!: SubmissionStatus;

  @ApiProperty({ example: '2025-11-12T16:30:00.000Z' })
  updatedAt!: Date;
}