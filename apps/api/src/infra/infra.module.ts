import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./database/prisma/prisma.service";
import { StoragePort } from "@/core/ports/storage.port";
import { SupabaseStorageAdapter } from "./storage/supabase-storage.adapter";
import { MailPort } from "@/core/ports/mail.port";
import { MailtrapAdapter } from "./mail/mailtrap.adapter";

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: StoragePort,
      useClass: SupabaseStorageAdapter,
    },
    {
      provide: MailPort,
      useClass: MailtrapAdapter,
    },
  ],
  exports: [PrismaService, StoragePort, MailPort],
})
export class InfraModule {}
