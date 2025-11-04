import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { 
  IInstalacaoRepository, // (Novo Port de Repositório)
  ILicencaRepository, // (Novo Port de Repositório)
  ILicenseServerGateway,
  LicenseValidationPayload,
} from '@app/domain';
import { Licenca, StatusLicenca } from '@prisma/client';
import { AtivarLicencaDTO } from '@application/dtos/licenca.dto';

@Injectable()
export class AtivarLicencaUseCase {
  constructor(
    @Inject(ILicencaRepository)
    private readonly licencaRepo: ILicencaRepository,
    @Inject(IInstalacaoRepository)
    private readonly instalacaoRepo: IInstalacaoRepository,
    @Inject(ILicenseServerGateway)
    private readonly licenseGateway: ILicenseServerGateway,
  ) {}

  async execute(dto: AtivarLicencaDTO): Promise<Licenca> {
    const { instalacaoId, chave } = dto;

    const instalacao = await this.instalacaoRepo.findById(instalacaoId);
    if (!instalacao) {
      throw new NotFoundException('Instalação não encontrada');
    }

    const existente = await this.licencaRepo.findByChave(chave);
    if (existente && existente.instalacaoId !== instalacaoId) {
      throw new ConflictException('Chave de licença já em uso por outra instalação');
    }
    
    // 1. Gera o "Bound Info" (Amarração) (Fase 11.3)
    const boundInfo = {
      instalacaoId: instalacao.id,
      nome: instalacao.nome,
      // TODO: Coletar métricas (ex: contagem de dispositivos)
      deviceCount: await this.instalacaoRepo.countDevices(instalacaoId),
    };

    // 2. Valida contra o Servidor Central (Fase 11.1)
    const payload: LicenseValidationPayload = {
      chave,
      boundInfo,
    };
    const resultado = await this.licenseGateway.validate(payload);

    // 3. Salva ou Atualiza a licença no DB local
    const data = {
      instalacaoId: instalacaoId,
      chave: chave,
      status: resultado.status,
      validade: resultado.validade,
      boundInfo: boundInfo as any,
      // (Módulos são salvos na tabela LicencaModuloMap)
    };
    
    const licencaSalva = await this.licencaRepo.upsert(data);
    
    // 4. Atualiza os módulos (Fase 11.1)
    await this.licencaRepo.syncModulos(licencaSalva.id, resultado.modulos);

    return licencaSalva;
  }
}