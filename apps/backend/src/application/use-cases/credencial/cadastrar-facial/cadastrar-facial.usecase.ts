import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import {
  ICredencialRepository,
  IPessoaRepository,
  IDeviceRepository,
  IFaceGateway,
} from '@app/domain';
import { CadastrarFacialDTO } from './cadastrar-facial.dto';
import { TipoCredencial, StatusCredencial, Prisma, TipoDispositivo } from '@prisma/client';
import { CredencialResponseDTO } from '@application/dtos/credencial.dto';

@Injectable()
export class CadastrarFacialUseCase {
  private readonly logger = new Logger(CadastrarFacialUseCase.name);

  constructor(
    @Inject(ICredencialRepository)
    private readonly credencialRepo: ICredencialRepository,
    @Inject(IPessoaRepository)
    private readonly pessoaRepo: IPessoaRepository,
    @Inject(IDeviceRepository)
    private readonly deviceRepo: IDeviceRepository,
    @Inject(IFaceGateway)
    private readonly faceGateway: IFaceGateway,
  ) {}

  async execute(dto: CadastrarFacialDTO): Promise<CredencialResponseDTO> {
    const { pessoaId, imagemBase64, pontoAcessoIds } = dto;

    // 1. Validar Pessoa
    const pessoa = await this.pessoaRepo.findById(pessoaId);
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    // 2. Gerar Template Facial (Fase 10.2)
    const imagemBuffer = Buffer.from(imagemBase64, 'base64');
    const templateId = await this.faceGateway.enrollFace(pessoaId, imagemBuffer);

    // 3. Salvar Credencial no DB
    const input: Prisma.CredencialCreateInput = {
      pessoa: { connect: { id: pessoaId } },
      tipo: TipoCredencial.FACIAL,
      status: StatusCredencial.ATIVA,
      valor: templateId, // 'valor' é o ID do Template
    };
    const credencial = await this.credencialRepo.create(input);
    this.logger.log(`Credencial Facial [${credencial.id}] criada para Pessoa [${pessoaId}]`);

    // 4. Buscar Leitores (Dispositivos)
    // (Se o escopo foi definido, busca leitores daqueles pontos, senão, todos)
    const leitores = await this.deviceRepo.findDevicesByPontoAcesso(
      pontoAcessoIds,
      TipoDispositivo.LEITOR_FACIAL,
    );
    
    const leitorIds = leitores.map(l => l.id);
    if (leitorIds.length === 0) {
      this.logger.warn(`Nenhum leitor facial encontrado para sincronizar a Pessoa [${pessoaId}]`);
    } else {
      // 5. Sincronizar (Fase 10.2)
      await this.faceGateway.syncToReaders(templateId, leitorIds);
    }
    
    return credencial as CredencialResponseDTO;
  }
}