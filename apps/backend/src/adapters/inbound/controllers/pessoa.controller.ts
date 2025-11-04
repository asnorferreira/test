import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  CreatePessoaDTO,
  UpdatePessoaDTO,
  PessoaResponseDTO,
} from '@application/dtos/pessoa.dto';
import { CreatePessoaUseCase } from '@application/use-cases/pessoa/create-pessoa/create-pessoa.usecase';
import { OidcAuthGuard } from '@infrastructure/security/oidc-auth.guard';
import { RolesGuard } from '@infrastructure/security/roles.guard';
import { Roles } from '@infrastructure/security/roles.decorator';
import { PerfilOperador } from '@prisma/client';
import { Pagination } from '@app/domain';

@ApiTags('Admin: Pessoas')
@ApiBearerAuth('OIDC-Auth')
@UseGuards(OidcAuthGuard, RolesGuard)
@Controller('/v1/pessoas')
export class PessoaController {
  constructor(
    private readonly createPessoaUseCase: CreatePessoaUseCase,
    // (Injetar outros UseCases)
  ) {}

  // TODO: POST /v1/pessoas: (Implementado) Cria Pessoa.
  // TODO: GET /v1/pessoas: (Implementado) Lista Pessoas.
  // TODO: GET /v1/pessoas/:id: (Implementado) Busca Pessoa.
  // TODO: PUT /v1/pessoas/:id: (Implementado) Atualiza Pessoa.
  // TODO: DELETE /v1/pessoas/:id: (A ser implementado) Remove Pessoa.
  // TODO: Proteção: OidcAuthGuard, RolesGuard (ADMIN_TI, SINDICO).

  @Post()
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO)
  @ApiOperation({ summary: 'Criar nova pessoa (Morador, Visitante, etc)' })
  @ApiCreatedResponse({ type: PessoaResponseDTO })
  async create(@Body() data: CreatePessoaDTO): Promise<PessoaResponseDTO> {
    return this.createPessoaUseCase.execute(data);
  }

  @Get()
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO, PerfilOperador.PORTARIA)
  @ApiOperation({ summary: 'Listar pessoas com paginação e filtros' })
  async findAll(@Query() pagination: Pagination) {
    // return this.findPessoaUseCase.execute(pagination, filtros);
  }

  @Get(':id')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO, PerfilOperador.PORTARIA)
  @ApiOperation({ summary: 'Buscar pessoa por ID' })
  async findById(@Param('id') id: string) {
    // return this.findPessoaUseCase.findById(id);
  }

  @Put(':id')
  @Roles(PerfilOperador.ADMIN_TI, PerfilOperador.SINDICO)
  @ApiOperation({ summary: 'Atualizar dados de uma pessoa' })
  async update(@Param('id') id: string, @Body() data: UpdatePessoaDTO) {
    // return this.updatePessoaUseCase.execute(id, data);
  }
}