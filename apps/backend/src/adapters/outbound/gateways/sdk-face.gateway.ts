import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IFaceGateway,
  IMessageBus,
  StreamRef,
  TemplateFacialId,
} from '@app/domain';
import { randomUUID } from 'crypto';

@Injectable()
export class SdkFaceGateway implements IFaceGateway {
  private readonly logger = new Logger(SdkFaceGateway.name);
  private readonly syncTopic: string;

  constructor(
    @Inject(IMessageBus)
    private readonly messageBus: IMessageBus,
  ) {
    this.syncTopic = process.env.TOPIC_EDGE_SYNC!;
  }

  /**
   * Processa uma imagem e gera um template facial (via SDK).
   * (Fase 10.2)
   */
  async enrollFace(
    pessoaId: string,
    imageRef: StreamRef,
  ): Promise<TemplateFacialId> {
    this.logger.log(`[SDK-Facial] Gerando template para Pessoa [${pessoaId}]`);
    // (Lógica real:
    //   const sdk = new FaceSDK();
    //   const template = await sdk.generateTemplate(imageRef as Buffer);
    //   return template.id;
    // )
    
    // Simula a geração de um template
    await new Promise(resolve => setTimeout(resolve, 500));
    const templateId = `template_${randomUUID()}`;
    
    this.logger.log(`[SDK-Facial] Template gerado: [${templateId}]`);
    return templateId;
  }

  /**
   * Sincroniza um template facial para leitores específicos.
   * (Fase 10.2)
   */
  async syncToReaders(
    faceId: TemplateFacialId,
    readerDeviceIds: string[],
  ): Promise<void> {
    this.logger.log(
      `[SDK-Facial] Solicitando sincronização do Template [${faceId}] para [${readerDeviceIds.length}] leitores.`,
    );

    // Em vez de chamar o SDK (o que violaria a Clean Arch),
    // publicamos um evento para o 'edge-service' (que ouve esta fila)
    // O 'edge-service' então chama 'enroll()' no driver (Fase 7)
    
    await this.messageBus.publish(
      `${this.syncTopic}.facial.enroll`, // Routing key (ex: edge.sync.facial.enroll)
      {
        templateId: faceId,
        dispositivos: readerDeviceIds,
      },
    );
  }
}