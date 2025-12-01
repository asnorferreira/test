import { Readable } from 'stream';

export type FileUpload = Express.Multer.File;

export type StorageUploadResult = {
  publicUrl: string;
  path: string;
};

export abstract class IStorageService {
  /**
   * Faz upload de um arquivo para o bucket.
   * @param file O buffer do arquivo.
   * @param originalName O nome original do arquivo, para extrair a extensão.
   * @param bucket O bucket de destino.
   * @param prefix Um prefixo de pasta opcional (ex: 'cvs/').
   */
  abstract upload(
    file: FileUpload,
    bucket: string,
    path: string,
  ): Promise<StorageUploadResult>;

  /**
   * Baixa um arquivo como um stream legível.
   * @param publicUrl A URL pública (ou caminho) do arquivo no storage.
   */
  abstract downloadFileStream(storagePath: string): Promise<Readable>;
}