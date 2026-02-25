import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { OrderService } from "../application/use-cases/order.service";
import { CreateOrderDto } from "../application/dtos/create-order.dto";
import { UpdateOrderStatusDto } from "../application/dtos/update-order-status.dto";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { UserRole } from "@maemais/shared-types";
import { CurrentUser } from "@/core/decorators/current-user.decorator";
import { PayOrderDto } from "../application/dtos/pay-order.dto";

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: "Criar um novo pedido (Venda Direta)" })
  @ApiResponse({
    status: 201,
    description: "Pedido gerado, aguardando pagamento",
  })
  async createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.id, dto);
  }

  @Get("my-orders")
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: "Ver o histórico de pedidos do usuário" })
  async getMyOrders(@CurrentUser() user: any) {
    return this.orderService.getUserOrders(user.id);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Atualizar status do pedido (Somente Admin)" })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }

  @Post(":id/pay")
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: "Realizar o pagamento do pedido (Aciona Gateway com Fallback)",
  })
  @ApiResponse({ status: 200, description: "Pagamento processado com sucesso" })
  async payOrder(
    @Param("id") id: string,
    @Body() dto: PayOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.payOrder(id, user.id, user.email, user.name, dto);
  }
}
