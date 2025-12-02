import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { IHashingService } from '@/modules/iam/domain/services/i-hashing.service';
import { IStorageService, FileUpload } from '@/core/storage/i-storage.service';
import { PublicJobApplicationDto } from '../../presentation/dtos/public-job-application.dto';
import { UserRole, SubmissionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class PublicJobApplicationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(dto: PublicJobApplicationDto, file: FileUpload) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.loginEmail },
    });

    if (existingUser) {
      throw new ConflictException('Este e-mail já possui cadastro. Por favor, faça login para aplicar.');
    }
    const passwordHash = await this.hashingService.hash(dto.loginPassword);

    const fileExt = extname(file.originalname); 
    const fileName = `${uuidv4()}${fileExt}`;
    const destinationPath = `resumes/${fileName}`;

    const { publicUrl: cvUrl } = await this.storageService.upload(
      file, 
      'curriculos',
      destinationPath
    );
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.loginEmail,
          fullName: dto.fullName,
          passwordHash,
          role: UserRole.CANDIDATE,
          isActive: true,
        },
      });

      await tx.candidateProfile.create({
        data: {
          userId: user.id,
          nomeCompleto: dto.fullName,
          telefone: dto.phone,
          cidade: dto.city,
          linkedinUrl: dto.linkedin,
        },
      });

      const submission = await tx.talentPoolSubmission.create({
        data: {
          candidateId: user.id,
          nomeCompleto: dto.fullName,
          email: dto.loginEmail,
          telefone: dto.phone,
          cidade: dto.city,
          linkedinUrl: dto.linkedin,
          areaDesejada: dto.jobArea,
          tipoContrato: dto.contractType,
          modalidade: dto.workMode,
          disponibilidade: dto.availability,
          descricaoVaga: dto.message,
          cvUrl: cvUrl,
          status: SubmissionStatus.NOVO,
        },
      });

      return submission;
    });

    return {
      success: true,
      message: 'Candidatura realizada com sucesso!',
      submissionId: result.submissionId,
    };
  }
}