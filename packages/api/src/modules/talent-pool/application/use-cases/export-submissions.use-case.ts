import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ITalentPoolRepository,
} from '../ports/i-talent-pool.repository';
import { IStorageService } from '@/core/storage/i-storage.service';
import { ExportTalentDto } from '../../presentation/dtos/export-talent.dto';
import { TalentPoolSubmission } from '@prisma/client';
import { Readable, Stream } from 'stream';
import { format, writeToStream } from 'fast-csv';
import archiver from 'archiver';

type ExportResult = {
  stream: Stream;
  filename: string;
  contentType: string;
};

@Injectable()
export class ExportSubmissionsUseCase {
  constructor(
    @Inject(ITalentPoolRepository)
    private readonly talentPoolRepo: ITalentPoolRepository,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(dto: ExportTalentDto): Promise<ExportResult> {
    if (!dto.includeData && !dto.includePdfs) {
      throw new BadRequestException('Selecione ao menos um tipo de exportação.');
    }

    const submissions = await this.fetchSubmissions(dto);
    if (dto.includeData && !dto.includePdfs) {
      const csvStream = this.createCsvStream(submissions);
      return {
        stream: csvStream,
        filename: 'jsp_export_candidatos.csv',
        contentType: 'text/csv',
      };
    }
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error("Erro fatal no stream do Archiver:", err);
      throw new InternalServerErrorException('Falha ao gerar o arquivo ZIP.');
    });
    if (dto.includeData) {
      const csvStream = this.createCsvStream(submissions);
      archive.append(csvStream, { name: 'export_data.csv' });
    }

    if (dto.includePdfs) {
      this.appendPdfsToZip(archive, submissions);
    }
    archive.finalize();

    return {
      stream: archive,
      filename: 'jsp_export_completo.zip',
      contentType: 'application/zip',
    };
  }

  /**
   * Busca as submissões com base no DTO
   */
  private async fetchSubmissions(
    dto: ExportTalentDto,
  ): Promise<TalentPoolSubmission[]> {
    if (dto.submissionIds && dto.submissionIds.length > 0) {
      return this.talentPoolRepo.findSubmissionsByIds(dto.submissionIds);
    }
    if (dto.filters) {
      return this.talentPoolRepo.findAllSubmissionsByFilter(dto.filters);
    }
    return this.talentPoolRepo.findAllSubmissionsByFilter({});
  }

  /**
   * Cria um stream de CSV a partir dos dados das submissões
   */
  private createCsvStream(submissions: TalentPoolSubmission[]): Readable {
    const csvStream = format({ headers: true });

    const csvData = submissions.map((s) => ({
      ID: s.submissionId,
      Nome: s.nomeCompleto,
      Email: s.email,
      Telefone: s.telefone,
      Cidade: s.cidade,
      LinkedIn: s.linkedinUrl,
      Area: s.areaDesejada,
      Contrato: s.tipoContrato,
      Modalidade: s.modalidade,
      Disponibilidade: s.disponibilidade,
      Descricao: s.descricaoVaga,
      Status: s.status,
      Link_CV: s.cvUrl,
      Enviado_Em: s.createdAt.toISOString(),
      Atualizado_Em: s.updatedAt.toISOString(),
    }));

    writeToStream(csvStream, csvData)
      .on('error', (err: Error) => {
        console.error('Erro ao gerar stream CSV:', err);
        csvStream.emit(
          'error',
          new InternalServerErrorException('Falha ao gerar CSV.'),
        );
      })
      .on('finish', () => {
        csvStream.end();
      });

    return csvStream;
  }

  /**
   * Baixa os PDFs do Supabase e os adiciona ao arquivo ZIP
   */
  private appendPdfsToZip(
    archive: archiver.Archiver,
    submissions: TalentPoolSubmission[],
  ): void {
    const downloadPromises = submissions
      .filter((s) => s.cvUrl)
      .map(async (submission) => {
        try {
          const fileStream = await this.storageService.downloadFileStream(
            submission.cvUrl,
          );

          const safeName = submission.nomeCompleto.replace(/[^a-z0-9]/gi, '_');
          const fileName = `curriculos/${submission.submissionId}-${safeName}.pdf`;

          archive.append(fileStream, { name: fileName });

        } catch (error) {
          console.error(`Falha ao baixar CV: ${submission.cvUrl}`, error);
          archive.append(
            `Erro ao baixar o CV ID: ${submission.submissionId}`,
            { name: `curriculos/ERRO_${submission.submissionId}.txt` },
          );
        }
      });
      
    Promise.all(downloadPromises).catch(err => {
        console.error("Erro no processo de download de PDF para ZIP", err);
        archive.emit("error", new InternalServerErrorException("Falha ao processar PDFs para o ZIP."));
    });
  }
}