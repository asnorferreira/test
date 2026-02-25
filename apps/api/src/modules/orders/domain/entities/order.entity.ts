import { Entity } from "@/core/domain/Entity";
import { OrderStatus } from "@maemais/shared-types";
import { OrderItem } from "./order-item.entity";

export interface OrderProps {
  userId: string;
  prescriptionId?: string | null;
  status: OrderStatus;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  trackingCode?: string | null;
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order extends Entity<OrderProps> {
  private constructor(props: OrderProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<OrderProps, "subtotalAmount" | "totalAmount" | "status">,
    id?: string,
  ): Order {
    const order = new Order(
      {
        ...props,
        status: OrderStatus.AWAITING_PAYMENT,
        subtotalAmount: 0,
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
    order.calculateTotals();
    return order;
  }

  calculateTotals() {
    this.props.subtotalAmount = this.props.items.reduce(
      (acc, item) => acc + item.getTotalPrice(),
      0,
    );
    this.props.totalAmount = this.props.subtotalAmount + this.props.shippingFee;
  }

  updateStatus(newStatus: OrderStatus) {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  setTrackingCode(code: string) {
    this.props.trackingCode = code;
    this.props.status = OrderStatus.SHIPPED;
    this.props.updatedAt = new Date();
  }
}
