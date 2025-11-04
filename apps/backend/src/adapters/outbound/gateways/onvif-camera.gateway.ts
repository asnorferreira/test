import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  ICameraGateway,
  IStorageGateway,
  SnapshotHint,
  SnapshotUri,
} from '@app/domain'; // Libs
import { IDeviceRepository } from '@app/domain'; // (Novo Port de Repositório)
import { StatusDispositivo, TipoDispositivo } from '@prisma/client';
// import { OnvifDevice } from 'node-onvif'; // (Simulado)

@Injectable()
export class OnvifCameraGateway implements ICameraGateway {
  private readonly logger = new Logger(OnvifCameraGateway.name);

  constructor(
    // (Precisamos de um repositório para buscar IPs das câmeras)
    @Inject(IDeviceRepository)
    private readonly deviceRepository: IDeviceRepository,
    @Inject(IStorageGateway) // (Implementado Fase 2)
    private readonly storage: IStorageGateway,
  ) {}

  /**
   * Captura um snapshot de uma câmera associada ao Ponto de Acesso.
   * (Fase 10.1)
   */
  async snapshot(
    pontoAcessoId: string,
    eventoId: string | bigint,
    hint?: SnapshotHint,
  ): Promise<SnapshotUri> {
    try {
      // 1. Encontrar a câmera associada ao Ponto de Acesso
      const camera = await this.deviceRepository.findCameraByPontoAcesso(
        pontoAcessoId,
      );
      if (!camera || camera.status !== StatusDispositivo.ONLINE) {
        throw new NotFoundException('Câmera não encontrada ou offline');
      }

      // 2. Conectar-se à câmera (ONVIF)
      this.logger.debug(`[ONVIF] Conectando à câmera ${camera.nome} (${camera.ip})`);
      // const device = new OnvifDevice({
      //   address: camera.ip,
      //   user: camera.usuario,
      //   pass: camera.senha,
      // });
      // await device.init();

      // 3. Obter o URI do snapshot
      // const snapshotUri = await device.getSnapshotUri();
      
      // 4. Buscar o buffer da imagem (Simulado)
      // const imageBuffer = await fetch(snapshotUri.uri).then(res => res.buffer());
      const imageBuffer = Buffer.from('fake-jpeg-image-data', 'utf-8');
      
      this.logger.debug(`[ONVIF] Snapshot capturado de ${camera.nome}`);

      // 5. Salvar no S3 (Fase 2.5)
      const key = `snapshots/${pontoAcessoId}/${eventoId}.jpg`;
      const { uri } = await this.storage.upload(
        key,
        imageBuffer,
        'image/jpeg',
      );

      return uri;
    } catch (error) {
      this.logger.error(
        `Falha ao capturar snapshot para Ponto [${pontoAcessoId}]`,
        error.message,
      );
      return 'error:snapshot_failed';
    }
  }
}