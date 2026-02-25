import { Module } from "@nestjs/common";
import { InvoiceRepository } from "./domain/repositories/invoice.repository";
import { PrismaInvoiceRepository } from "./infra/prisma-invoice.repository";
import { InvoiceService } from "./application/use-cases/invoice.service";
import { InvoicesController } from "./presentation/invoices.controller";
import { OrderPaidListener } from "./application/listeners/order-paid.listener";

@Module({
  controllers: [InvoicesController],
  providers: [
    InvoiceService,
    OrderPaidListener,
    {
      provide: InvoiceRepository,
      useClass: PrismaInvoiceRepository,
    },
  ],
  exports: [InvoiceService],
})
export class InvoicesModule {}
