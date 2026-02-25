import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "maria@email.com", description: "E-mail do usuário" })
  @IsEmail({}, { message: "Formato de e-mail inválido." })
  @IsNotEmpty({ message: "O e-mail é obrigatório." })
  email!: string;

  @ApiProperty({ example: "senhaSegura123", description: "Senha de acesso" })
  @IsString()
  @IsNotEmpty({ message: "A senha é obrigatória." })
  password!: string;
}
