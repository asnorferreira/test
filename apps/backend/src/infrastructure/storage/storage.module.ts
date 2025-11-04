import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { IStorageGateway } from 'apps/backend/src/interfaces/outbound/storage-gateway.port';
import { S3StorageGateway } from 'apps/backend/src/adapters/outbound/gateways/s3-storage.gateway';
import { ServicesConfig } from 'apps/backend/src/infrastructure/config/config.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        const config = configService.get<ServicesConfig['storage']>(
          'services.storage',
          { infer: true },
        );
        return new S3Client({
          endpoint: config.endpoint,
          region: config.region,
          credentials: {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
          },
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: IStorageGateway,
      useClass: S3StorageGateway,
    },
  ],
  exports: [IStorageGateway],
})
export class StorageModule {}