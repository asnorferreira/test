import { Module } from "@nestjs/common";
import { ProductRepository } from "./domain/repositories/product.repository";
import { PrismaProductRepository } from "./infra/prisma-product.repository";
import { ProductService } from "./application/use-cases/product.service";
import { ProductsController } from "./presentation/products.controller";

@Module({
  controllers: [ProductsController],
  providers: [
    ProductService,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [ProductService, ProductRepository],
})
export class ProductsModule {}
