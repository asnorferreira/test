import { Logger, Module } from '@nestjs/common';
import { ConfigAppModule } from './infrastructure/config/config.module';
import { ObservabilityModule } from 'apps/backend/src/infrastructure/observability/observability.module';
import { DatabaseModule } from 'apps/backend/src/infrastructure/database/database.module';
import { SecurityModule } from 'apps/backend/src/infrastructure/security/security.module';
import { MessagingModule } from 'apps/backend/src/infrastructure/messaging/messaging.module';
import { StorageModule } from 'apps/backend/src/infrastructure/storage/storage.module';

@Module({
  imports: [
    ConfigAppModule,
    ObservabilityModule,
    DatabaseModule,
    SecurityModule,
    MessagingModule,
    StorageModule,
    // TODO: Adicionar módulos de Domínio/Aplicação (ex: PessoaModule, AcessoModule)
  ],
  controllers: [],
  providers: [
    Logger,
    // TODO: Adicionar provedores globais (ex: AuditLogInterceptor)
  ],
})
export class AppModule {}