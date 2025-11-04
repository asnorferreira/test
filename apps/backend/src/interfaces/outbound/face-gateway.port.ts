export type StreamRef = Buffer | string;
export type TemplateFacialId = string;

export interface IFaceGateway {
  enrollFace(pessoaId: string, imageRef: StreamRef): Promise<TemplateFacialId>;
  syncToReaders(faceId: TemplateFacialId, readerDeviceIds: string[]): Promise<void>;
  removeFromReaders?(faceId: TemplateFacialId, readerDeviceIds: string[]): Promise<void>;
}

export const IFaceGateway = Symbol('IFaceGateway');