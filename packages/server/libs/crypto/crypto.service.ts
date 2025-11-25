import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length !== 64) {
      this.logger.error('ENCRYPTION_KEY deve ser uma string hex de 64 caracteres (32 bytes).');
      throw new InternalServerErrorException('Configuração de criptografia inválida.');
    }
    this.key = Buffer.from(encryptionKey, 'hex');
  }

  /**
   * Criptografa um texto.
   * @param text O texto plano (ex: token da API)
   * @returns Uma string no formato iv:authTag:encryptedText
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      this.logger.error('Falha ao criptografar', error);
      throw new InternalServerErrorException('Falha na criptografia.');
    }
  }

  /**
   * Descriptografa um texto.
   * @param hash A string no formato iv:authTag:encryptedText
   * @returns O texto plano
   */
  decrypt(hash: string): string {
    try {
      const parts = hash.split(':');
      if (parts.length !== 3) {
        throw new Error('Hash de criptografia inválido.');
      }

      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Falha ao descriptografar', error);
      throw new InternalServerErrorException('Falha na descriptografia.');
    }
  }
}
