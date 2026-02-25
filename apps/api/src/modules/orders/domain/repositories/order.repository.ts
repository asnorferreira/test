import { Order } from "../entities/order.entity";

export abstract class OrderRepository {
  abstract create(order: Order): Promise<void>;
  abstract update(order: Order): Promise<void>;
  abstract findById(id: string): Promise<Order | null>;
  abstract findByUserId(userId: string): Promise<Order[]>;
}
