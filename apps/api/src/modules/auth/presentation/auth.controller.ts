import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "../application/use-cases/auth.service";
import { LoginDto } from "../application/dtos/login.dto";
import { RegisterDto } from "../application/dtos/register.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Realizar login na plataforma" })
  @ApiResponse({
    status: 200,
    description: "Login efetuado com sucesso (Retorna o JWT)",
  })
  @ApiResponse({ status: 401, description: "Credenciais inválidas" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Cadastrar um novo paciente" })
  @ApiResponse({
    status: 201,
    description: "Paciente registrado com sucesso (Retorna o JWT)",
  })
  @ApiResponse({ status: 409, description: "E-mail já em uso" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerPatient(registerDto);
  }
}
