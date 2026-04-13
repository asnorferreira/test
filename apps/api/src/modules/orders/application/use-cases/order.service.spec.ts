import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderRepository } from "../../domain/repositories/order.repository";
import { ProductRepository } from "@/modules/products/domain/repositories/product.repository";
import { PrescriptionRepository } from "@/modules/prescriptions/domain/repositories/prescription.repository";
import { PaymentGatewayPort } from "../../domain/ports/payment-gateway.port";
import { Product } from "@/modules/products/domain/entities/product.entity";
import { Prescription } from "@/modules/prescriptions/domain/entities/prescription.entity";
import { Order } from "../../domain/entities/order.entity";
import {
  CONSTANTS,
  OrderStatus,
  PrescriptionStatus,
} from "@maemais/shared-types";
import { CreateOrderDto } from "../dtos/create-order.dto";

describe("OrderService", () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<OrderRepository>;
  let productRepo: jest.Mocked<ProductRepository>;
  let prescriptionRepo: jest.Mocked<PrescriptionRepository>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const validAddress = {
    zipCode: "01310-100",
    street: "Av Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    recipient: "Maria",
    phone: "11999999999",
  };

  const makePrescription = (
    overrides: Partial<{
      status: PrescriptionStatus;
      validUntil: Date | undefined;
    }> = {},
  ) =>
    Prescription.create(
      {
        medicalCaseId: "mc-1",
        doctorId: "d-1",
        documentUrl: "http://fake.pdf",
        status: overrides.status ?? PrescriptionStatus.ACTIVE,
        validUntil: overrides.validUntil,
      },
      "presc-1",
    );

  const makeDto = (overrides: Partial<CreateOrderDto> = {}): CreateOrderDto => ({
    prescriptionId: "presc-1",
    items: [{ productId: "prod-1", quantity: 2 }],
    shippingAddress: validAddress,
    shippingFeeCents: 1990,
    ...overrides,
  });

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
            findByUserId: jest.fn(),
          },
        },
        { provide: ProductRepository, useValue: { findById: jest.fn() } },
        {
          provide: PrescriptionRepository,
          useValue: {
            findById: jest.fn(),
            belongsToUser: jest.fn(),
          },
        },
        {
          provide: PaymentGatewayPort,
          useValue: { processPayment: jest.fn() },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(OrderService);
    orderRepo = module.get(OrderRepository);
    productRepo = module.get(ProductRepository);
    prescriptionRepo = module.get(PrescriptionRepository);
    paymentGateway = module.get(PaymentGatewayPort);
    eventEmitter = module.get(EventEmitter2);
  });

  describe("create", () => {
    it("bloqueia quando não há prescriptionId", async () => {
      await expect(
        service.create("u-1", makeDto({ prescriptionId: undefined })),
      ).rejects.toThrow(ForbiddenException);
    });

    it("bloqueia prescrição cancelada", async () => {
      prescriptionRepo.findById.mockResolvedValue(
        makePrescription({ status: PrescriptionStatus.CANCELLED }),
      );
      await expect(service.create("u-1", makeDto())).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("bloqueia prescrição expirada", async () => {
      prescriptionRepo.findById.mockResolvedValue(
        makePrescription({ validUntil: new Date(Date.now() - 10000) }),
      );
      await expect(service.create("u-1", makeDto())).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("bloqueia prescrição que não pertence ao usuário", async () => {
      prescriptionRepo.findById.mockResolvedValue(makePrescription());
      prescriptionRepo.belongsToUser.mockResolvedValue(false);
      await expect(service.create("u-1", makeDto())).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("cria pedido com endereço e frete quando prescrição é válida", async () => {
      prescriptionRepo.findById.mockResolvedValue(makePrescription());
      prescriptionRepo.belongsToUser.mockResolvedValue(true);
      productRepo.findById.mockResolvedValue(
        Product.create(
          {
            name: "Vitamina",
            slug: "vitamina",
            description: "",
            isActive: true,
            basePrice: 5000,
          },
          "prod-1",
        ) as any,
      );

      const result = await service.create("u-1", makeDto());

      expect(orderRepo.create).toHaveBeenCalled();
      expect(result.shippingFee).toBe(1990);
      expect(result.subtotalAmount).toBe(10000);
      expect(result.totalAmount).toBe(11990);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CONSTANTS.EVENTS.ORDER_CREATED,
        expect.objectContaining({ userId: "u-1" }),
      );
    });

    it("rejeita produto inativo", async () => {
      prescriptionRepo.findById.mockResolvedValue(makePrescription());
      prescriptionRepo.belongsToUser.mockResolvedValue(true);
      productRepo.findById.mockResolvedValue(
        Product.create(
          {
            name: "X",
            slug: "x",
            description: "",
            isActive: false,
            basePrice: 1,
          },
          "prod-1",
        ) as any,
      );

      await expect(service.create("u-1", makeDto())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("payOrder", () => {
    function seedOrder() {
      const order = Order.create(
        {
          userId: "u-1",
          items: [],
          shippingFee: 1990,
          shippingAddress: {
            zipCode: "01310100",
            street: "Av Paulista",
            number: "1000",
            complement: null,
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            recipient: "Maria",
            phone: "11999999999",
          },
        },
        "o-1",
      );
      order.props.totalAmount = 15000;
      return order;
    }

    it("processa pagamento, grava gateway info e emite ORDER_PAID", async () => {
      const order = seedOrder();
      orderRepo.findById.mockResolvedValue(order);
      paymentGateway.processPayment.mockResolvedValue({
        success: true,
        transactionId: "tx_123",
        gatewayOrderId: "or_123",
        gatewayUsed: "PAGARME",
      });

      const result = await service.payOrder(
        "o-1",
        "u-1",
        "test@test.com",
        "Test",
        { paymentMethod: "CREDIT_CARD", cardToken: "tok_1" },
      );

      expect(paymentGateway.processPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "o-1",
          paymentMethod: "CREDIT_CARD",
          shipping: expect.objectContaining({
            amountCents: 1990,
            recipientName: "Maria",
          }),
        }),
      );
      expect(orderRepo.update).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.PAID);
      expect(result.transactionId).toBe("tx_123");
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CONSTANTS.EVENTS.ORDER_PAID,
        expect.objectContaining({ orderId: "o-1", totalAmountCents: 15000 }),
      );
    });

    it("emite PAYMENT_FAILED e lança erro quando gateway recusa", async () => {
      orderRepo.findById.mockResolvedValue(seedOrder());
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
