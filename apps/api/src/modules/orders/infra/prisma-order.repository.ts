import { Injectable } from "@nestjs/common";
import { OrderRepository } from "../domain/repositories/order.repository";
import { Order } from "../domain/entities/order.entity";
import { OrderItem } from "../domain/entities/order-item.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { OrderStatus } from "@maemais/shared-types";

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        userId: order.props.userId,
        prescriptionId: order.props.prescriptionId,
        status: order.props.status,
        subtotalAmount: order.props.subtotalAmount,
        shippingFee: order.props.shippingFee,
        totalAmount: order.props.totalAmount,
        trackingCode: order.props.trackingCode,
        items: {
          create: order.props.items.map((item) => ({
            id: item.id,
            productId: item.props.productId,
            quantity: item.props.quantity,
            unitPrice: item.props.unitPrice,
          })),
        },
      },
    });
  }

  async update(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.props.status,
        trackingCode: order.props.trackingCode,
        updatedAt: order.props.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const raw = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return raw.map((item) => this.mapToDomain(item));
  }

  private mapToDomain(raw: any): Order {
    const items = raw.items.map((i: any) =>
      OrderItem.create(
        {
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
        },
        i.id,
      ),
    );

    const order = Order.create(
      {
        userId: raw.userId,
        prescriptionId: raw.prescriptionId,
        shippingFee: Number(raw.shippingFee),
        trackingCode: raw.trackingCode,
        items,
      },
      raw.id,
    );

    order.props.status = raw.status as OrderStatus;
    order.props.createdAt = raw.createdAt;
    order.props.updatedAt = raw.updatedAt;

    return order;
  }
}
