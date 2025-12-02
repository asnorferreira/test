import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessResponse {
  @ApiProperty({
    description: 'Token de Acesso JWT (Bearer)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Token de Atualização (enviado via cookie HttpOnly)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}