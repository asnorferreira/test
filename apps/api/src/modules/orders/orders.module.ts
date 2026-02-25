import { Module } from "@nestjs/common";
import { OrderRepository } from "./domain/repositories/order.repository";
import { PrismaOrderRepository } from "./infra/prisma-order.repository";
import { OrderService } from "./application/use-cases/order.service";
import { OrdersController } from "./presentation/orders.controller";
import { ProductsModule } from "../products/products.module";

import { PaymentGatewayPort } from "./domain/ports/payment-gateway.port";
import { PagarmeGateway } from "./infra/payment/pagarme.gateway";
import { StripeGateway } from "./infra/payment/stripe.gateway";
import { PaymentManager } from "./infra/payment/payment.manager";

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [
    OrderService,
    PagarmeGateway,
    StripeGateway,
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
    {
      provide: PaymentGatewayPort,
      useClass: PaymentManager,
    },
  ],
  exports: [OrderService],
})
export class OrdersModule {}
