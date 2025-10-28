import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { AnalyzeResponseDto } from './dtos/analyze-response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/api-gateway/core/auth/guards/jwt-auth.guard';

@ApiTags('Analyzer')
@ApiBearerAuth()
@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Executa a análise de uma mensagem de conversa.' })
  @ApiResponse({ status: 200, description: 'Análise retornada com sucesso.', type: AnalyzeResponseDto })
  @ApiResponse({ status: 404, description: 'Política ativa não encontrada para a campanha.' })
  analyze(@Body() payload: AnalyzePayloadDto): Promise<AnalyzeResponseDto> {
    return this.analyzerService.analyze(payload);
  }
}

