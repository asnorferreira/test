import { Body, Controller, Post } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { AnalyzePayloadDto } from './dtos/analyze-payload.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Analyzer (Fallback)')
@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @Post('fallback')
  @ApiOperation({ summary: 'Executa uma análise básica (fallback) de uma conversa.' })
  analyze(@Body() payload: AnalyzePayloadDto) {
    return this.analyzerService.analyze(payload);
  }
}

