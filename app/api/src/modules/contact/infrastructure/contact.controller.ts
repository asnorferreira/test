import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Public } from '@/modules/iam/infrastructure/authentication/decorators/public.decorator';
import { CreateContactDto } from '../presentation/dtos/create-contact.dto';
import { SendContactMessageUseCase } from '../application/use-cases/send-contact-message.use-case';

@ApiTags('4. Fale Conosco (Geral)')
@Controller('contact')
export class ContactController {
  constructor(private readonly sendContactMessageUseCase: SendContactMessageUseCase) {}

  @Public()
  @Post()
  @ApiOperation({ 
    summary: 'Envio de mensagem de contato (Fale Conosco)',
    description: 'Endpoint público para dúvidas gerais, SAC e parcerias.'
  })
  @ApiCreatedResponse({ description: 'Mensagem enviada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  async sendMessage(@Body() dto: CreateContactDto) {
    return this.sendContactMessageUseCase.execute(dto);
  }
}