import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProductRepository } from "../../domain/repositories/product.repository";
import { Product } from "../../domain/entities/product.entity";
import { CreateProductDto } from "../dtos/create-product.dto";
import { UpdateProductDto } from "../dtos/update-product.dto";
import { CONSTANTS } from "@maemais/shared-types";

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepo: ProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateProductDto) {
    const slug = this.generateSlug(dto.name);

    const existing = await this.productRepo.findBySlug(slug);
    if (existing)
      throw new ConflictException("Já existe um produto com este nome/slug.");

    const product = Product.create({
      name: dto.name,
      slug,
      description: dto.description,
      basePrice: dto.basePrice,
      isActive: dto.isActive ?? true,
    });

    await this.productRepo.create(product);
    return this.mapToResponse(product);
  }

  async findAll(activeOnly: boolean) {
    const products = await this.productRepo.findAll(activeOnly);
    return products.map((p) => this.mapToResponse(p));
  }

  async findOne(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException("Produto não encontrado.");
    return this.mapToResponse(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException("Produto não encontrado.");

    let hasPriceChanged = false;

    if (dto.name && dto.name !== product.props.name) {
      const newSlug = this.generateSlug(dto.name);
      const existing = await this.productRepo.findBySlug(newSlug);
      if (existing)
        throw new ConflictException("Já existe um produto com este novo nome.");
      product.props.name = dto.name;
      product.props.slug = newSlug;
    }

    if (dto.description !== undefined)
      product.props.description = dto.description;

    if (
      dto.basePrice !== undefined &&
      dto.basePrice !== product.props.basePrice
    ) {
      product.updatePrice(dto.basePrice);
      hasPriceChanged = true;
    }

    if (dto.isActive !== undefined) product.toggleActive(dto.isActive);

    await this.productRepo.update(product);

    this.eventEmitter.emit(CONSTANTS.EVENTS.PRODUCT_UPDATED, {
      productId: product.id,
      hasPriceChanged,
    });

    return this.mapToResponse(product);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-");
  }

  private mapToResponse(product: Product) {
    return {
      id: product.id,
      name: product.props.name,
      slug: product.props.slug,
      description: product.props.description,
      basePrice: product.props.basePrice,
      isActive: product.props.isActive,
      createdAt: product.props.createdAt,
    };
  }
}
