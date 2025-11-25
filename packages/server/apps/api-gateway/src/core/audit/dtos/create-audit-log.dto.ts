import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'ID do usuário que realizou a ação.', format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Email do usuário que realizou a ação.', example: 'admin@demo.local' })
  @IsString()
  userEmail: string;
  
  @ApiProperty({ description: 'Tipo da ação realizada.', example: 'CREATE_USER' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'ID do recurso que foi afetado pela ação.', format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ description: 'ID do tenant onde a ação ocorreu.', format: 'uuid' })
  @IsUUID()
  tenantId: string;

  @ApiPropertyOptional({ 
    description: 'Objeto JSON com detalhes adicionais sobre a ação (ex: payload da requisição).', 
    type: 'object',
    example: { email: 'newuser@test.com', role: 'ATENDENTE' },
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}