import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { OrderRepository } from "../../domain/repositories/order.repository";
import { Order } from "../../domain/entities/order.entity";
import { OrderItem } from "../../domain/entities/order-item.entity";
import { CreateOrderDto } from "../dtos/create-order.dto";
import { UpdateOrderStatusDto } from "../dtos/update-order-status.dto";
import { ProductRepository } from "@/modules/products/domain/repositories/product.repository";
import { CONSTANTS, OrderStatus } from "@maemais/shared-types";
import { PaymentGatewayPort } from "../../domain/ports/payment-gateway.port";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PayOrderDto } from "../dtos/pay-order.dto";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (dto.items.length === 0)
      throw new BadRequestException("O pedido deve conter pelo menos um item.");

    const orderItems: OrderItem[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findById(itemDto.productId);
      if (!product || !product.props.isActive) {
        throw new BadRequestException(
          `Produto ${itemDto.productId} indisponível ou inativo.`,
        );
      }

      orderItems.push(
        OrderItem.create({
          productId: product.id,
          quantity: itemDto.quantity,
          unitPrice: product.props.basePrice,
        }),
      );
    }

    const order = Order.create({
      userId,
      prescriptionId: dto.prescriptionId,
      shippingFee: CONSTANTS.DEFAULT_SHIPPING_FEE_CENTS,
      items: orderItems,
    });

    await this.orderRepo.create(order);

    return this.mapToResponse(order);
  }

  async getUserOrders(userId: string) {
    const orders = await this.orderRepo.findByUserId(userId);
    return orders.map((o) => this.mapToResponse(o));
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundException("Pedido não encontrado.");

    order.updateStatus(dto.status);

    if (dto.status === OrderStatus.SHIPPED && dto.trackingCode) {
      order.setTrackingCode(dto.trackingCode);
    }

    await this.orderRepo.update(order);
    return this.mapToResponse(order);
  }

  private mapToResponse(order: Order) {
    return {
      id: order.id,
      status: order.props.status,
      subtotalAmount: order.props.subtotalAmount,
      shippingFee: order.props.shippingFee,
      totalAmount: order.props.totalAmount,
      trackingCode: order.props.trackingCode,
      createdAt: order.props.createdAt,
      items: order.props.items.map((i) => ({
        productId: i.props.productId,
        quantity: i.props.quantity,
        unitPrice: i.props.unitPrice,
        total: i.getTotalPrice(),
      })),
    };
  }

  async payOrder(
    orderId: string,
    userId: string,
    userEmail: string,
    userName: string,
    dto: PayOrderDto,
  ) {
    const order = await this.orderRepo.findById(orderId);

    if (!order || order.props.userId !== userId) {
      throw new NotFoundException("Pedido não encontrado.");
    }

    if (order.props.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `O pedido já está com status: ${order.props.status}`,
      );
    }

    const paymentResult = await this.paymentGateway.processPayment({
      orderId: order.id,
      amountCents: order.props.totalAmount,
      customerEmail: userEmail,
      customerName: userName,
      paymentMethod: dto.paymentMethod,
      cardToken: dto.cardToken,
    });

    if (!paymentResult.success) {
      this.eventEmitter.emit(CONSTANTS.EVENTS.PAYMENT_FAILED, {
        orderId: order.id,
        userId,
      });
      throw new BadRequestException(paymentResult.error);
    }

    order.updateStatus(OrderStatus.PAID);
    await this.orderRepo.update(order);

    this.logger.log(
      `Pedido ${order.id} PAGO com sucesso via ${paymentResult.gatewayUsed}. Transação: ${paymentResult.transactionId}`,
    );

    this.eventEmitter.emit(CONSTANTS.EVENTS.ORDER_PAID, {
      orderId: order.id,
      userId: order.props.userId,
      totalAmountCents: order.props.totalAmount,
    });

    return this.mapToResponse(order);
  }
}
