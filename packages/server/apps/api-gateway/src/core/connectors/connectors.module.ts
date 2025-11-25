import { Module } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { AuditModule } from '../audit/audit.module';
import { CryptoModule } from 'libs/crypto/crypto.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuditModule, CryptoModule, HttpModule],
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
})
export class ConnectorsModule {}
