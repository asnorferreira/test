import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus, TalentPoolSubmission } from '@prisma/client';

export class TalentSubmissionFullResponse implements TalentPoolSubmission {
  @ApiProperty({ example: 'clx123abc456def789' })
  id!: string;

  @ApiProperty({ example: 'JSP-1001' })
  submissionId!: string;

  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.NOVO })
  status!: SubmissionStatus;

  @ApiProperty({ example: 'clx987xyz654abc321' })
  candidateId!: string;

  @ApiProperty({
    example: 'https://supabase.com/storage/v1/object/public/cvs/cv.pdf',
  })
  cvUrl!: string;

  @ApiProperty({ example: 'João da Silva' })
  nomeCompleto!: string;

  @ApiProperty({ example: 'joao@email.com' })
  email!: string;

  @ApiProperty({ example: '(81) 99999-8888', nullable: true })
  telefone!: string | null;

  @ApiProperty({ example: 'Recife - PE', nullable: true })
  cidade!: string | null;

  @ApiProperty({ example: 'linkedin.com/in/joao', nullable: true })
  linkedinUrl!: string | null;

  @ApiProperty({ example: 'Administrativo' })
  areaDesejada!: string;

  @ApiProperty({ example: 'CLT' })
  tipoContrato!: string;

  @ApiProperty({ example: 'Presencial' })
  modalidade!: string;

  @ApiProperty({ example: 'Imediata' })
  disponibilidade!: string;

  @ApiProperty({ example: 'Busco vaga de assistente...', nullable: true })
  descricaoVaga!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}