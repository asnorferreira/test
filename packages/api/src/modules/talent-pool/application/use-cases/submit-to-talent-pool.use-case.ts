import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IProfilesRepository } from '@/modules/profiles/application/ports/i-profiles.repository';
import { IIamRepository } from '@/modules/iam/application/ports/i-iam.repository';
import {
  FileUpload,
  IStorageService,
} from '@/core/storage/i-storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmitTalentDto } from '../../presentation/dtos/submit-talent.dto';
import { TalentPoolEvents } from '../../domain/talent-pool-events.constants';
import {
  CreateSubmissionDto,
  ITalentPoolRepository,
} from '../ports/i-talent-pool.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubmitToTalentPoolUseCase {
  private readonly cvBucket: string;

  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,
    @Inject(IProfilesRepository)
    private readonly profilesRepo: IProfilesRepository,
    @Inject(IIamRepository)
    private readonly iamRepo: IIamRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    const bucket = this.configService.get<string>('SUPABASE_CV_BUCKET');
    if (!bucket) {
      throw new InternalServerErrorException(
        'SUPABASE_CV_BUCKET não está configurado.',
      );
    }
    this.cvBucket = bucket;
  }

  async execute(
    dto: SubmitTalentDto,
    candidateId: string,
    file: FileUpload,
  ) {
    const [user, profile] = await Promise.all([
      this.iamRepo.findById(candidateId),
      this.profilesRepo.findByUserId(candidateId),
    ]);

    if (!user) {
      throw new NotFoundException('Usuário candidato não encontrado.');
    }
    if (!profile) {
      throw new BadRequestException(
        'Perfil do candidato (Passo 2) não encontrado. Por favor, preencha o perfil antes de submeter.',
      );
    }

    const filePath = `${candidateId}/${Date.now()}-${file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}`;

    const { publicUrl } = await this.storageService.upload(
      file,
      this.cvBucket,
      filePath,
    );

    const submissionDto: CreateSubmissionDto = {
      candidateId: user.id,
      cvUrl: publicUrl,
      nomeCompleto: profile.nomeCompleto,
      email: user.email,
      telefone: profile.telefone,
      cidade: profile.cidade,
      linkedinUrl: profile.linkedinUrl,
      areaDesejada: dto.areaDesejada,
      tipoContrato: dto.tipoContrato,
      modalidade: dto.modalidade,
      disponibilidade: dto.disponibilidade,
      descricaoVaga: dto.descricaoVaga,
    };

    const submission = await this.talentPoolRepo.createSubmission(submissionDto);

    this.eventEmitter.emit(TalentPoolEvents.SUBMISSION_CREATED, {
      candidateEmail: user.email,
      candidateName: user.fullName,
    });

    return {
      message: 'Currículo enviado com sucesso!',
      submissionId: submission.submissionId,
    };
  }
}