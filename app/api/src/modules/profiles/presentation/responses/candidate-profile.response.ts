import { ApiProperty } from '@nestjs/swagger';
import { CandidateProfile } from '@prisma/client';

export class CandidateProfileResponse implements CandidateProfile {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  nomeCompleto!: string;

  @ApiProperty({ nullable: true })
  telefone!: string | null;

  @ApiProperty({ nullable: true })
  cidade!: string | null;

  @ApiProperty({ nullable: true })
  linkedinUrl!: string | null;

  @ApiProperty()
  updatedAt!: Date;
}