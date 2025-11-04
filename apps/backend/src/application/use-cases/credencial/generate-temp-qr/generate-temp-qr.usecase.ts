import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ICredencialRepository,
  IPessoaRepository,
} from '@app/domain';
import { QrCodeService, QrCodePayload } from '@domain/services/qr-code.service';
import { GenerateQrCodeDTO, QrCodeResponseDTO } from '@application/dtos/credencial.dto';
import { TipoCredencial, StatusCredencial, Prisma } from '@prisma/client';
import { addMinutes } from 'date-fns';

@Injectable()
export class GenerateTempQrUseCase {
  constructor(
    @Inject(ICredencialRepository)
    private readonly credencialRepository: ICredencialRepository,
    @Inject(IPessoaRepository)
    private readonly pessoaRepository: IPessoaRepository,
    private readonly qrCodeService: QrCodeService,
  ) {}

  async execute(data: GenerateQrCodeDTO): Promise<QrCodeResponseDTO> {
    const pessoa = await this.pessoaRepository.findById(data.pessoaId);
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    const { valor, payload, imagem } = await this.qrCodeService.generate(
      data.pessoaId,
      data.pontoAcessoIds,
      data.expiracaoMinutos,
    );

    const vigenciaFim = new Date(payload.exp * 1000);

    const credencialInput: Prisma.CredencialCreateInput = {
      tipo: TipoCredencial.QR_CODE,
      status: StatusCredencial.ATIVA,
      valor: valor,
      vigenciaFim: vigenciaFim,
      vigenciaInicio: new Date(),
      meta: payload as any,
      pessoa: { connect: { id: data.pessoaId } },
    };

    const credencial = await this.credencialRepository.create(credencialInput);

    // TODO: Publicar no MessageBus (edge.sync) para o Edge Service
    // this.messageBus.publish('edge.sync.credencial', credencial);

    return {
      credencialId: credencial.id,
      valor: valor,
      qrCodeImageBase64: imagem,
      vigenciaFim: vigenciaFim,
    };
  }
}