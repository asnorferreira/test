import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import PDFDocument from "pdfkit";
import { InvoiceRepository } from "../../domain/repositories/invoice.repository";
import { Invoice } from "../../domain/entities/invoice.entity";
import { StoragePort } from "@/core/ports/storage.port";
import { InvoiceType } from "@maemais/shared-types";

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly CUSTO_FARMACIA_CENTS = 5000;

  constructor(
    private readonly repo: InvoiceRepository,
    private readonly storage: StoragePort,
  ) {}

  private async generateRealPdfBuffer(content: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc.fontSize(16).text("Documento Fiscal MãeMais", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(content);
      doc.end();
    });
  }

  async generateSplitInvoices(
    orderId: string,
    totalAmountCents: number,
  ): Promise<void> {
    this.logger.log(
      `Gerando NFs (Farmácia e Intermediação) para o pedido ${orderId}...`,
    );

    if (totalAmountCents < this.CUSTO_FARMACIA_CENTS) {
      this.logger.error(
        `Anomalia financeira: Pedido ${orderId} com valor inferior ao repasse da farmácia.`,
      );
      throw new BadRequestException(
        "Valor do pedido inválido para geração de NFs.",
      );
    }

    const farmaciaAmount = this.CUSTO_FARMACIA_CENTS;
    const intermediacaoAmount = totalAmountCents - farmaciaAmount;

    try {
      const pdfFarmaciaBuffer = await this.generateRealPdfBuffer(
        `NOTA FISCAL PRODUTO (FARMÁCIA)\nValor: R$ ${(farmaciaAmount / 100).toFixed(2)}\nPedido: ${orderId}`,
      );
      const pdfPlataformaBuffer = await this.generateRealPdfBuffer(
        `NOTA FISCAL INTERMEDIAÇÃO (PLATAFORMA)\nValor: R$ ${(intermediacaoAmount / 100).toFixed(2)}\nPedido: ${orderId}`,
      );

      const [pathFarmacia, pathPlataforma] = await Promise.all([
        this.storage.uploadPdf(
          `invoices/farmacia_${orderId}.pdf`,
          pdfFarmaciaBuffer,
        ),
        this.storage.uploadPdf(
          `invoices/plataforma_${orderId}.pdf`,
          pdfPlataformaBuffer,
        ),
      ]);

      const nfFarmacia = Invoice.create({
        orderId,
        type: InvoiceType.FARMACIA_PRODUTO,
        amount: farmaciaAmount,
        documentUrl: pathFarmacia,
      });

      const nfPlataforma = Invoice.create({
        orderId,
        type: InvoiceType.PLATAFORMA_INTERMEDIACAO,
        amount: intermediacaoAmount,
        documentUrl: pathPlataforma,
      });

      await this.repo.createMany([nfFarmacia, nfPlataforma]);

      this.logger.log(
        `NFs geradas e salvas com sucesso para o pedido ${orderId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Erro crítico ao gerar NFs do pedido ${orderId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Falha no processamento das notas fiscais.",
      );
    }
  }

  async getInvoicesByOrder(orderId: string) {
    const invoices = await this.repo.findByOrderId(orderId);
    const results = await Promise.all(
      invoices.map(async (inv) => {
        const secureUrl = await this.storage.getFileUrl(inv.props.documentUrl);
        return {
          id: inv.id,
          type: inv.props.type,
          amount: inv.props.amount,
          url: secureUrl,
          issuedAt: inv.props.issuedAt,
        };
      }),
    );
    return results;
  }
}
