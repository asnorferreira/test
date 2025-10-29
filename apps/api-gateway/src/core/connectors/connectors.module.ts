import { Module } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { AuditModule } from '../audit/audit.module';
import { CryptoModule } from 'libs/crypto/crypto.module';

@Module({
  imports: [AuditModule, CryptoModule],
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
})
export class ConnectorsModule {}
