import { Module } from '@nestjs/common';
import { CoreConfigModule } from './config/config.module';
import { CorePrismaModule } from './core/prisma/prisma.module';
import { IamModule } from './modules/iam/iam.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { TalentPoolModule } from './modules/talent-pool/talent-pool.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CoreStorageModule } from './core/storage/storage.module';
import { CoreEmailModule } from './core/email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    CoreConfigModule,
    CorePrismaModule,
    CoreStorageModule,
    CoreEmailModule,
    EventEmitterModule.forRoot(), 
    IamModule,
    ProfilesModule,
    TalentPoolModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}