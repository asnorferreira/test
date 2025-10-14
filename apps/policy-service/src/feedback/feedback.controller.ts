import { Controller, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { JwtAuthGuard } from 'apps/api-gateway/src/core/auth/guards/jwt-auth.guard';
import { Roles } from 'apps/api-gateway/src/core/auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'apps/api-gateway/src/core/auth/guards/roles.guard';

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
}
