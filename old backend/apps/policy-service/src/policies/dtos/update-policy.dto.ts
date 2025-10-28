import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdatePolicyDto {
  @ApiPropertyOptional({ description: 'Corpo da política em JSON.' })
  @IsOptional()
  @IsObject()
  body?: any;

  @ApiPropertyOptional({ description: 'Define se a política está ativa.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}