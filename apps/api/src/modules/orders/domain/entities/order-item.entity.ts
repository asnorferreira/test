import { Entity } from "@/core/domain/Entity";

export interface OrderItemProps {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class OrderItem extends Entity<OrderItemProps> {
  private constructor(props: OrderItemProps, id?: string) {
    super(props, id);
  }

  static create(props: OrderItemProps, id?: string): OrderItem {
    if (props.quantity <= 0)
      throw new Error("Quantidade deve ser maior que zero.");
    if (props.unitPrice < 0)
      throw new Error("Preço unitário não pode ser negativo.");
    return new OrderItem(props, id);
  }

  getTotalPrice(): number {
    return this.props.quantity * this.props.unitPrice;
  }
}
