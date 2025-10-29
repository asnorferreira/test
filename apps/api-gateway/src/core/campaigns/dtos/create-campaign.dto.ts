import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({
    example: 'Campanha de Cobrança 1',
    description: 'Nome da campanha.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    description: 'ID do tenant ao qual a campanha pertence.',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}
