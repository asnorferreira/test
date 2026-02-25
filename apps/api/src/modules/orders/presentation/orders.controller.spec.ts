import { Test, TestingModule } from "@nestjs/testing";
import { OrdersController } from "./orders.controller";
import { OrderService } from "../application/use-cases/order.service";

describe("OrdersController", () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
            getUserOrders: jest.fn(),
            payOrder: jest.fn().mockResolvedValue({ status: "PAID" }),
          },
        },
      ],
    }).compile();

    controller = module.get(OrdersController);
    service = module.get(OrderService);
  });

  it("deve chamar payOrder corretamente", async () => {
    const dto = { paymentMethod: "PIX" as const };
    const user = { id: "u-1", email: "test@t.com", name: "Test" };

    await controller.payOrder("o-1", dto, user);

    expect(service.payOrder).toHaveBeenCalledWith(
      "o-1",
      user.id,
      user.email,
      user.name,
      dto,
    );
  });
});
