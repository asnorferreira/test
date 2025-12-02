import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@jsp/shared';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffUserDto {
  @ApiProperty({
    example: 'Ana Ribeiro (RH)',
    description: 'Nome completo do usuário staff',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  fullName!: string; 

  @ApiProperty({
    example: 'rh@jsp.com',
    description: 'E-mail corporativo do usuário',
  })
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string; 

  @ApiProperty({
    enum: [UserRole.RH, UserRole.GESTOR],
    example: UserRole.RH,
    description: 'Papel do novo usuário (RH ou GESTOR)',
  })
  @IsEnum(UserRole)
  @IsNotEmpty({ message: 'O papel (role) é obrigatório.' })
  role!: UserRole.RH | UserRole.GESTOR; 
}