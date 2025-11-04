import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageGateway } from 'apps/backend/src/interfaces/outbound/storage-gateway.port';
import { ServicesConfig } from 'apps/backend/src/infrastructure/config/config.service';

@Injectable()
export class S3StorageGateway implements IStorageGateway {
  private readonly logger = new Logger(S3StorageGateway.name);
  private readonly s3Config: ServicesConfig['storage'];

  constructor(
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.s3Config = this.configService.get<ServicesConfig['storage']>(
      'services.storage',
      { infer: true },
    );
  }

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ uri: string; key: string }> {
    const bucket = this.s3Config.bucket;
    this.logger.log(`Fazendo upload do objeto [${key}] para o bucket [${bucket}]`);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'private',
    });

    try {
      await this.s3Client.send(command);
      const uri = `${this.s3Config.endpoint}/${bucket}/${key}`;
      return { uri, key };
    } catch (error) {
      this.logger.error(`Falha no upload do objeto [${key}]`, error);
      throw new Error(`S3 Upload Failed: ${error.message}`);
    }
  }

  async getPresignedUrl(key: string): Promise<string> {
    const bucket = this.s3Config.bucket;
    const expiresIn = this.s3Config.presignedUrlExpiresIn;

    this.logger.log(
      `Gerando URL assinada para [${key}] (expira em ${expiresIn}s)`,
    );

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresIn,
      });
    } catch (error) {
      this.logger.error(`Falha ao gerar URL assinada para [${key}]`, error);
      throw new Error(`S3 Presigned URL Failed: ${error.message}`);
    }
  }
}