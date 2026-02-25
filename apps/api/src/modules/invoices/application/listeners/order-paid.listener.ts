import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InvoiceService } from "../use-cases/invoice.service";
import { CONSTANTS } from "@maemais/shared-types";

@Injectable()
export class OrderPaidListener {
  constructor(private readonly invoiceService: InvoiceService) {}

  @OnEvent(CONSTANTS.EVENTS.ORDER_PAID, { async: true })
  async handleOrderPaidEvent(event: {
    orderId: string;
    totalAmountCents: number;
  }) {
    await this.invoiceService.generateSplitInvoices(
      event.orderId,
      event.totalAmountCents,
    );
  }
}
