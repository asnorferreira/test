import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConnectorDto {
  @ApiProperty({ example: 'whatsapp', description: 'Provedor do conector (whatsapp, pbx, etc.)' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ example: 'Conta Principal WTS', description: 'Nome de identificação do conector' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'seu_token_de_api_secreto', description: 'Token de autenticação ou credencial' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
