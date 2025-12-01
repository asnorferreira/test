export abstract class IHashingService {
  abstract hash(data: string | Buffer): Promise<string>;
  abstract compare(data: string | Buffer, hash: string): Promise<boolean>;
}