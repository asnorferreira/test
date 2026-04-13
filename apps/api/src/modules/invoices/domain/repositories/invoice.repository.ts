import { Invoice } from "../entities/invoice.entity";

export abstract class InvoiceRepository {
  abstract create(invoice: Invoice): Promise<void>;
  abstract createMany(invoices: Invoice[]): Promise<void>;
  abstract findByOrderId(orderId: string): Promise<Invoice[]>;
}
