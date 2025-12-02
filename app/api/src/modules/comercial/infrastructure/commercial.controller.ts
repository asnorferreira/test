import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Public } from '@/modules/iam/infrastructure/authentication/decorators/public.decorator';
import { CreateProposalDto } from '../presentation/dtos/create-proposal.dto';
import { CreateProposalUseCase } from '../application/use-cases/create-proposal.use-case';

@ApiTags('3. Comercial (B2B)')
@Controller('commercial')
export class CommercialController {
  constructor(private readonly createProposalUseCase: CreateProposalUseCase) {}

  @Public()
  @Post('proposals')
  @ApiOperation({ 
    summary: 'Recebimento de proposta de terceirização (Lead B2B)',
    description: 'Recebe os dados do formulário de contato para empresas.'
  })
  @ApiCreatedResponse({ description: 'Proposta registrada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' })
  async createProposal(@Body() dto: CreateProposalDto) {
    return this.createProposalUseCase.execute(dto);
  }
}