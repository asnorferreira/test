import { IHashingService } from '@/modules/iam/domain/services/i-hashing.service';
import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class BcryptService implements IHashingService {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  compare(data: string | Buffer, hash: string): Promise<boolean> {
    return compare(data, hash);
  }
}