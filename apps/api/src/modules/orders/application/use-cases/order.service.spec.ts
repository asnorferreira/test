import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderRepository } from "../../domain/repositories/order.repository";
import { ProductRepository } from "@/modules/products/domain/repositories/product.repository";
import { PaymentGatewayPort } from "../../domain/ports/payment-gateway.port";
import { Product } from "@/modules/products/domain/entities/product.entity";
import { Order } from "../../domain/entities/order.entity";
import { CONSTANTS, OrderStatus } from "@maemais/shared-types";

describe("OrderService", () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<OrderRepository>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: ProductRepository, useValue: { findById: jest.fn() } },
        {
          provide: PaymentGatewayPort,
          useValue: { processPayment: jest.fn() },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(OrderService);
    orderRepo = module.get(OrderRepository);
    paymentGateway = module.get(PaymentGatewayPort);
    eventEmitter = module.get(EventEmitter2);
  });

  describe("payOrder", () => {
    it("deve processar o pagamento, atualizar o status e emitir ORDER_PAID", async () => {
      const order = Order.create(
        {
          userId: "u-1",
          items: [],
          shippingFee: 0,
        },
        "o-1",
      );
      order.props.totalAmount = 15000;
      orderRepo.findById.mockResolvedValue(order);
      paymentGateway.processPayment.mockResolvedValue({
        success: true,
        transactionId: "tx_123",
        gatewayUsed: "STRIPE",
      });

      const result = await service.payOrder(
        "o-1",
        "u-1",
        "test@test.com",
        "Test",
        { paymentMethod: "CREDIT_CARD" },
      );

      expect(paymentGateway.processPayment).toHaveBeenCalled();
      expect(orderRepo.update).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.PAID);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CONSTANTS.EVENTS.ORDER_PAID,
        expect.objectContaining({ orderId: "o-1", totalAmountCents: 15000 }),
      );
    });

    it("deve emitir PAYMENT_FAILED e lançar erro se o gateway recusar", async () => {
      const order = Order.create(
        {
          userId: "u-1",
          items: [],
          shippingFee: 0,
        },
        "o-1",
      );
      orderRepo.findById.mockResolvedValue(order);
      paymentGateway.processPayment.mockResolvedValue({
        success: false,
        error: "Cartão recusado",
      });

      await expect(
        service.payOrder("o-1", "u-1", "test@test.com", "Test", {
          paymentMethod: "CREDIT_CARD",
        }),
      ).rejects.toThrow(BadRequestException);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CONSTANTS.EVENTS.PAYMENT_FAILED,
        expect.objectContaining({ orderId: "o-1", userId: "u-1" }),
      );
    });
  });
});
