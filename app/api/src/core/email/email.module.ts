import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { IEmailService } from "./i-email.service";
import { MailtrapService } from "./mailtrap.service";
// import { MailgunEmailService } from "./mailgun.service";

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    {
      provide: IEmailService,
      useClass: MailtrapService,
    },
  ],
  exports: [IEmailService],
})
export class CoreEmailModule {}
