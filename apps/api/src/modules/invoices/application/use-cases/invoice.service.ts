import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
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

    const pdfFarmaciaBuffer = Buffer.from(
      `NOTA FISCAL PRODUTO (FARMÁCIA)\nValor: R$ ${farmaciaAmount / 100}\nPedido: ${orderId}`,
    );
    const pdfPlataformaBuffer = Buffer.from(
      `NOTA FISCAL INTERMEDIAÇÃO (PLATAFORMA)\nValor: R$ ${intermediacaoAmount / 100}\nPedido: ${orderId}`,
    );

    try {
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

      await this.repo.create(nfFarmacia);
      await this.repo.create(nfPlataforma);

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
        const publicUrl = await this.storage.getFileUrl(inv.props.documentUrl);
        return {
          id: inv.id,
          type: inv.props.type,
          amount: inv.props.amount,
          url: publicUrl,
          issuedAt: inv.props.issuedAt,
        };
      }),
    );

    return results;
  }
}
