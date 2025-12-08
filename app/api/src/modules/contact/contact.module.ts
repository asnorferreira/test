import { Module } from '@nestjs/common';
import { CorePrismaModule } from '@/core/prisma/prisma.module';
import { CoreEmailModule } from '@/core/email/email.module'; // Importe o módulo de e-mail
import { ContactController } from './infrastructure/contact.controller';
import { SendContactMessageUseCase } from './application/use-cases/send-contact-message.use-case';
import { ContactRepository } from './infrastructure/adapters/contact.repository';

@Module({
  imports: [CorePrismaModule, CoreEmailModule],
  controllers: [ContactController],
  providers: [
    SendContactMessageUseCase,
    ContactRepository,
  ],
})
export class ContactModule {}