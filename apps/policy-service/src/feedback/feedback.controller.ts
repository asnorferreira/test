import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req, ParseUUIDPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';
import { UpdateFeedbackDto } from './dtos/update-feedback.dto';

@ApiTags('AI Feedback (QA)')
@ApiBearerAuth()
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('suggestion/:id')
  @Roles(UserRole.QA, UserRole.SUPERVISOR, UserRole.ADMIN)  
  @ApiOperation({ summary: 'Envia feedback sobre uma sugestão da IA.' })
  @ApiResponse({ status: 201, description: 'Feedback registrado com sucesso.' })
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Req() req) {
    return this.feedbackService.create(createFeedbackDto, req.user.id, req.user.tenantId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Lista todos os feedbacks.' })
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.QA, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Busca um feedback por ID.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.QA)
  @ApiOperation({ summary: 'Atualiza um feedback.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.QA)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um feedback.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.remove(id);
  }
}
