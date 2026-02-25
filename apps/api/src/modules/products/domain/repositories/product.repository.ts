import { Product } from "../entities/product.entity";

export abstract class ProductRepository {
  abstract create(product: Product): Promise<void>;
  abstract update(product: Product): Promise<void>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findBySlug(slug: string): Promise<Product | null>;
  abstract findAll(activeOnly?: boolean): Promise<Product[]>;
}
