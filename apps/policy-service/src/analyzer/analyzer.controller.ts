import { Body, Controller, Post } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { AnalyzeResponseDto } from './dtos/analyze-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Analyzer (Fallback)')
@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @Post('fallback')
  @ApiOperation({ summary: 'Executa uma análise básica (fallback) de uma conversa.' })
  @ApiResponse({ status: 200, description: 'Análise retornada com sucesso.', type: AnalyzeResponseDto }) // DTO atualizado
  analyze(@Body() payload: AnalyzePayloadDto) {
    return this.analyzerService.analyze(payload);
  }
}

