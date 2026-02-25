export abstract class StoragePort {
  abstract uploadPdf(fileName: string, fileBuffer: Buffer): Promise<string>;
  abstract getFileUrl(filePath: string): Promise<string>;
}
