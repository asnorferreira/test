import { Injectable } from "@nestjs/common";
import { InvoiceRepository } from "../domain/repositories/invoice.repository";
import { Invoice } from "../domain/entities/invoice.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { InvoiceType } from "@maemais/shared-types";

@Injectable()
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(invoice: Invoice): Promise<void> {
    await this.prisma.invoice.create({
      data: {
        id: invoice.id,
        orderId: invoice.props.orderId,
        type: invoice.props.type,
        amount: invoice.props.amount,
        documentUrl: invoice.props.documentUrl,
        issuedAt: invoice.props.issuedAt,
      },
    });
  }

  async findByOrderId(orderId: string): Promise<Invoice[]> {
    const raw = await this.prisma.invoice.findMany({ where: { orderId } });
    return raw.map((item) =>
      Invoice.create(
        {
          orderId: item.orderId,
          type: item.type as InvoiceType,
          amount: Number(item.amount),
          documentUrl: item.documentUrl,
          issuedAt: item.issuedAt,
        },
        item.id,
      ),
    );
  }
}
