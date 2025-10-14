import { Controller, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CoachGateway } from './coach.gateway';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SuggestionPayloadDto } from './dtos/suggestion-payload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/ts-shared';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coach')
export class CoachController {
  constructor(private readonly coachGateway: CoachGateway) {}

  @Post('conversation/:id/suggestion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envia uma nova sugestão/análise para o frontend via WebSocket' })
  @ApiParam({ name: 'id', description: 'ID da Conversa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Sugestão enviada para a sala da conversa.' })
  handleNewSuggestion(
    @Param('id') conversationId: string,
    @Body() suggestionPayload: SuggestionPayloadDto,
  ) {
    this.coachGateway.sendSuggestion(conversationId, suggestionPayload.payload);
    return { status: 'suggestion sent' };
  }
}
