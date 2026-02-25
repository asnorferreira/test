import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "./products.controller";
import { ProductService } from "../application/use-cases/product.service";

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: "1", slug: "produto" }),
            findAll: jest.fn().mockResolvedValue([{ id: "1" }]),
            findOne: jest.fn().mockResolvedValue({ id: "1" }),
            update: jest.fn().mockResolvedValue({ id: "1" }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductService);
  });

  it("deve chamar o service.create", async () => {
    const dto = { name: "Produto", basePrice: 100 };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it("deve chamar o service.findAll", async () => {
    await controller.findAll("true");
    expect(service.findAll).toHaveBeenCalledWith(true);
  });

  it("deve chamar o service.update", async () => {
    const dto = { basePrice: 150 };
    await controller.update("1", dto);
    expect(service.update).toHaveBeenCalledWith("1", dto);
  });
});
