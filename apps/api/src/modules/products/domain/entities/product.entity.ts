import { Entity } from "@/core/domain/Entity";

export interface ProductProps {
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  basePrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  static create(props: ProductProps, id?: string): Product {
    return new Product(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  updatePrice(newPrice: number) {
    if (newPrice < 0) throw new Error("O preço não pode ser negativo.");
    this.props.basePrice = newPrice;
    this.props.updatedAt = new Date();
  }

  toggleActive(status: boolean) {
    this.props.isActive = status;
    this.props.updatedAt = new Date();
  }
}
