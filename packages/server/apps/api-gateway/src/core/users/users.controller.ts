import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { AuditService } from '../audit/audit.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    ) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do perfil do usuário autenticado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id, req.user);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.QA)
  @ApiOperation({ summary: 'Cria um novo usuário (Acesso: ADMIN, SUPERVISOR, QA)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou e-mail já existente.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    const newUser = await this.usersService.create(createUserDto, req.user);
    
    await this.auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CREATE_USER',
      targetId: newUser.id,
      tenantId: req.user.tenantId,
      details: createUserDto,
    });

    return newUser;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.QA)
  @ApiOperation({ summary: 'Lista todos os usuários (Acesso: ADMIN, SUPERVISOR, QA)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAll(@Req() req) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.QA)
  @ApiOperation({ summary: 'Busca um usuário por ID (Acesso: ADMIN, SUPERVISOR, QA)' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.usersService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.QA)
  @ApiOperation({ summary: 'Atualiza um usuário por ID (Acesso: ADMIN, SUPERVISOR, QA)' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser atualizado (UUID)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const updatedUser = await this.usersService.update(id, updateUserDto, req.user);

    await this.auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'UPDATE_USER',
      targetId: id,
      tenantId: req.user.tenantId,
      details: updateUserDto,
    });

    return updatedUser;
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove um usuário por ID (Acesso: ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser removido (UUID)' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    await this.usersService.remove(id, req.user);

    await this.auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'DELETE_USER',
        targetId: id,
        tenantId: req.user.tenantId
      });
  }
}