import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({ description: 'Data de início para o filtro do período.', example: '2025-10-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Data final para o filtro do período.', example: '2025-10-31T23:59:59.000Z' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ description: 'ID do Tenant a ser filtrado (apenas para ADMINs).', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}