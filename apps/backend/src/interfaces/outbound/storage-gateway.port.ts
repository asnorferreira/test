export interface IStorageGateway {
  upload(key: string, body: Buffer, contentType: string): Promise<{ uri: string; key: string }>;
  getPresignedUrl(key: string): Promise<string>;
}

export const IStorageGateway = Symbol('IStorageGateway');