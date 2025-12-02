import { Module } from '@nestjs/common';
import { CoreEmailModule } from '@/core/email/email.module';
import { IamModule } from '@/modules/iam/iam.module';
import { EmailTemplatesService } from './domain/email-templates.service';
import { AuthListener } from './application/listeners/auth.listener';
import { TalentPoolListener } from './application/listeners/talent-pool.listener';

@Module({
  imports: [
    CoreEmailModule, 
    IamModule,
  ],
  providers: [
    EmailTemplatesService,
    AuthListener,
    TalentPoolListener,
  ],
})
export class NotificationsModule {}