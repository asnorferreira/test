import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ProductService } from "../application/use-cases/product.service";
import { CreateProductDto } from "../application/dtos/create-product.dto";
import { UpdateProductDto } from "../application/dtos/update-product.dto";
import { JwtAuthGuard } from "@/core/guards/jwt-auth.guard";
import { RolesGuard } from "@/core/guards/roles.guard";
import { Roles } from "@/core/decorators/roles.decorator";
import { UserRole } from "@maemais/shared-types";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Criar um novo produto (Apenas Admin)" })
  @ApiResponse({ status: 201, description: "Produto criado com sucesso" })
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar produtos" })
  @ApiQuery({
    name: "activeOnly",
    required: false,
    type: Boolean,
    description: "Filtrar apenas produtos ativos",
  })
  @ApiResponse({ status: 200, description: "Lista de produtos retornada" })
  async findAll(@Query("activeOnly") activeOnly?: string) {
    const isActives = activeOnly === "true";
    return this.productService.findAll(isActives);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar produto por ID" })
  @ApiResponse({ status: 200, description: "Produto retornado com sucesso" })
  async findOne(@Param("id") id: string) {
    return this.productService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualizar um produto (Apenas Admin)" })
  @ApiResponse({ status: 200, description: "Produto atualizado com sucesso" })
  async update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }
}
