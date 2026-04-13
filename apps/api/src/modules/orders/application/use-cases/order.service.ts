import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { OrderRepository } from "../../domain/repositories/order.repository";
import { Order, ShippingAddress } from "../../domain/entities/order.entity";
import { OrderItem } from "../../domain/entities/order-item.entity";
import { CreateOrderDto } from "../dtos/create-order.dto";
import { UpdateOrderStatusDto } from "../dtos/update-order-status.dto";
import { ProductRepository } from "@/modules/products/domain/repositories/product.repository";
import { PrescriptionRepository } from "@/modules/prescriptions/domain/repositories/prescription.repository";
import {
  CONSTANTS,
  OrderStatus,
  PrescriptionStatus,
} from "@maemais/shared-types";
import { PaymentGatewayPort } from "../../domain/ports/payment-gateway.port";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PayOrderDto } from "../dtos/pay-order.dto";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly prescriptionRepo: PrescriptionRepository,
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (dto.items.length === 0)
      throw new BadRequestException("O pedido deve conter pelo menos um item.");

    // Regra: só pode comprar produto depois que o médico liberar (prescrição ACTIVE).
    await this.ensureActivePrescription(userId, dto.prescriptionId);

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

    const shippingAddress: ShippingAddress = {
      zipCode: dto.shippingAddress.zipCode.replace(/\D/g, ""),
      street: dto.shippingAddress.street,
      number: dto.shippingAddress.number,
      complement: dto.shippingAddress.complement ?? null,
      neighborhood: dto.shippingAddress.neighborhood,
      city: dto.shippingAddress.city,
      state: dto.shippingAddress.state,
      recipient: dto.shippingAddress.recipient,
      phone: dto.shippingAddress.phone,
    };

    const order = Order.create({
      userId,
      prescriptionId: dto.prescriptionId,
      shippingFee: dto.shippingFeeCents,
      items: orderItems,
      shippingAddress,
      partnerPharmacyId: dto.partnerPharmacyId ?? null,
    });

    await this.orderRepo.create(order);

    this.eventEmitter.emit(CONSTANTS.EVENTS.ORDER_CREATED, {
      orderId: order.id,
      userId,
    });

    return this.mapToResponse(order);
  }

  private async ensureActivePrescription(
    userId: string,
    prescriptionId?: string,
  ) {
    if (!prescriptionId) {
      throw new ForbiddenException(
        "É necessário uma prescrição médica ativa para finalizar a compra.",
      );
    }
    const prescription = await this.prescriptionRepo.findById(prescriptionId);
    if (!prescription) {
      throw new NotFoundException("Prescrição não encontrada.");
    }
    if (prescription.props.status !== PrescriptionStatus.ACTIVE) {
      throw new ForbiddenException(
        `Prescrição com status ${prescription.props.status} não permite compra.`,
      );
    }
    if (
      prescription.props.validUntil &&
      prescription.props.validUntil.getTime() < Date.now()
    ) {
      throw new ForbiddenException("Prescrição expirada.");
    }
    const owns = await this.prescriptionRepo.belongsToUser(
      prescriptionId,
      userId,
    );
    if (!owns) {
      throw new ForbiddenException(
        "Esta prescrição não pertence ao usuário atual.",
      );
    }
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
      shippingAddress: order.props.shippingAddress,
      partnerPharmacyId: order.props.partnerPharmacyId,
      paymentGateway: order.props.paymentGateway,
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

    const addr = order.props.shippingAddress;
    const paymentResult = await this.paymentGateway.processPayment({
      orderId: order.id,
      amountCents: order.props.totalAmount,
      customerEmail: userEmail,
      customerName: userName,
      customerDocument: dto.customerDocument,
      customerPhone: addr?.phone,
      paymentMethod: dto.paymentMethod,
      cardToken: dto.cardToken,
      installments: dto.installments ?? 1,
      items: order.props.items.map((i) => ({
        description: `Produto ${i.props.productId}`,
        quantity: i.props.quantity,
        unitAmountCents: i.props.unitPrice,
      })),
      shipping: addr
        ? {
            amountCents: order.props.shippingFee,
            recipientName: addr.recipient,
            recipientPhone: addr.phone,
            address: {
              zipCode: addr.zipCode,
              street: addr.street,
              number: addr.number,
              complement: addr.complement,
              neighborhood: addr.neighborhood,
              city: addr.city,
              state: addr.state,
            },
          }
        : undefined,
    });

    if (!paymentResult.success) {
      this.eventEmitter.emit(CONSTANTS.EVENTS.PAYMENT_FAILED, {
        orderId: order.id,
        userId,
      });
      throw new BadRequestException(paymentResult.error);
    }

    order.setGatewayInfo(
      paymentResult.gatewayUsed ?? "UNKNOWN",
      paymentResult.gatewayOrderId,
      paymentResult.transactionId,
    );
    order.updateStatus(OrderStatus.PAID);
    await this.orderRepo.update(order);

    this.logger.log(
      `Pedido ${order.id} PAGO via ${paymentResult.gatewayUsed}. Tx: ${paymentResult.transactionId}`,
    );

    this.eventEmitter.emit(CONSTANTS.EVENTS.ORDER_PAID, {
      orderId: order.id,
      userId: order.props.userId,
      totalAmountCents: order.props.totalAmount,
    });

    return {
      ...this.mapToResponse(order),
      transactionId: paymentResult.transactionId,
      pix: paymentResult.pix,
    };
  }
}
