import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductRepository } from "../../domain/repositories/product.repository";
import { Product } from "../../domain/entities/product.entity";

describe("ProductService", () => {
  let service: ProductService;
  let repo: jest.Mocked<ProductRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            findBySlug: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repo = module.get(ProductRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  describe("create", () => {
    it("deve criar um novo produto com sucesso", async () => {
      repo.findBySlug.mockResolvedValue(null);

      const dto = { name: "Formula MaeMais", basePrice: 150 };

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalled();
      expect(result.slug).toBe("formula-maemais");
      expect(result.basePrice).toBe(150);
    });

    it("deve lançar ConflictException se o slug já existir", async () => {
      repo.findBySlug.mockResolvedValue({} as Product);

      await expect(
        service.create({ name: "Formula", basePrice: 100 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("deve atualizar o produto corretamente", async () => {
      const existingProduct = Product.create({
        name: "Old",
        slug: "old",
        basePrice: 100,
        isActive: true,
      });

      repo.findById.mockResolvedValue(existingProduct);
      repo.findBySlug.mockResolvedValue(null);

      const result = await service.update("id", {
        name: "New Name",
        basePrice: 200,
      });

      expect(repo.update).toHaveBeenCalled();
      expect(result.name).toBe("New Name");
      expect(result.slug).toBe("new-name");
      expect(result.basePrice).toBe(200);
    });

    it("deve lançar NotFoundException ao tentar atualizar produto inexistente", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update("invalid-id", { basePrice: 200 }),
      ).rejects.toThrow(NotFoundException);
    });

    it("deve emitir evento quando o preço for alterado", async () => {
      const product = Product.create({
        name: "Old",
        slug: "old",
        basePrice: 100,
        isActive: true,
      });

      repo.findById.mockResolvedValue(product);
      repo.findBySlug.mockResolvedValue(null);

      await service.update("id", { basePrice: 200 });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "product.updated",
        expect.objectContaining({
          hasPriceChanged: true,
        }),
      );
    });
  });
});
