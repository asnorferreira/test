import { Injectable } from "@nestjs/common";
import { ProductRepository } from "../domain/repositories/product.repository";
import { Product } from "../domain/entities/product.entity";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: product.id,
        name: product.props.name,
        slug: product.props.slug,
        description: product.props.description,
        isActive: product.props.isActive,
        basePrice: product.props.basePrice,
      },
    });
  }

  async update(product: Product): Promise<void> {
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.props.name,
        slug: product.props.slug,
        description: product.props.description,
        isActive: product.props.isActive,
        basePrice: product.props.basePrice,
        updatedAt: product.props.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({ where: { slug } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findAll(activeOnly = false): Promise<Product[]> {
    const raw = await this.prisma.product.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return raw.map((item) => this.mapToDomain(item));
  }

  private mapToDomain(raw: any): Product {
    return Product.create(
      {
        name: raw.name,
        slug: raw.slug,
        description: raw.description,
        isActive: raw.isActive,
        basePrice: Number(raw.basePrice),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
