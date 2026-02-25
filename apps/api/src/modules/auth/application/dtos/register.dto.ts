import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Maria Silva", description: "Nome completo" })
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório." })
  name!: string;

  @ApiProperty({ example: "maria@email.com", description: "E-mail do usuário" })
  @IsEmail({}, { message: "Formato de e-mail inválido." })
  @IsNotEmpty({ message: "O e-mail é obrigatório." })
  email!: string;

  @ApiProperty({
    example: "senhaSegura123",
    description: "Senha com no mínimo 6 caracteres",
  })
  @IsString()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres." })
  password!: string;

  @ApiPropertyOptional({
    example: "11999999999",
    description: "Telefone para contato (opcional)",
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: "12345678909",
    description: "CPF do usuário (opcional)",
  })
  @IsString()
  @IsOptional()
  cpf?: string;
}
