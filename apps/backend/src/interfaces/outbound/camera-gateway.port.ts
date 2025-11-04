export type SnapshotHint = {
  cameraIp?: string;
  // ... outras hints
};

export type SnapshotUri = string;

export interface ICameraGateway {
  snapshot(
    pontoAcessoId: string,
    at: Date,
    hint?: SnapshotHint,
  ): Promise<SnapshotUri>;

  /**
   * (Opcional) Retorna uma URL de stream (via proxy) para visualização.
   * NUNCA expor o IP da câmera diretamente.
   */
  // getStreamProxyUrl(pontoAcessoId: string): Promise<string>;
}

export const ICameraGateway = Symbol('ICameraGateway');