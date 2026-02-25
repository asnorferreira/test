import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { InvoiceService } from "../application/use-cases/invoice.service";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";

@ApiTags("Invoices")
@Controller("invoices")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get("order/:orderId")
  @ApiOperation({ summary: "Obter notas fiscais de um pedido específico" })
  @ApiResponse({
    status: 200,
    description: "URLs e metadados das NFs retornados",
  })
  async getInvoices(@Param("orderId") orderId: string) {
    return this.invoiceService.getInvoicesByOrder(orderId);
  }
}
