import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class PublicJobApplicationDto {
  // --- Auth (Login) ---
  @ApiProperty({ name: 'loginEmail', description: 'E-mail para login', example: 'candidato@email.com' })
  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  loginEmail!: string;

  @ApiProperty({ name: 'loginPassword', description: 'Senha para acesso futuro', example: 'MinhaSenhaForte123' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  loginPassword!: string;

  // --- Profile (Dados Pessoais) ---
  @ApiProperty({ name: 'fullName', description: 'Nome completo', example: 'Carlos Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome completo é obrigatório.' })
  fullName!: string;

  @ApiProperty({ name: 'phone', description: 'Telefone/WhatsApp', example: '(11) 99999-9999' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório.' })
  phone!: string;

  @ApiPropertyOptional({ name: 'city', description: 'Cidade e Estado', example: 'São Paulo - SP' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ name: 'linkedin', description: 'URL do LinkedIn' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  // --- Submission (Dados da Vaga) ---
  @ApiProperty({ name: 'jobArea', description: 'Área de interesse', example: 'Facilities' })
  @IsString()
  @IsNotEmpty({ message: 'Área de interesse é obrigatória.' })
  jobArea!: string;

  @ApiProperty({ name: 'contractType', description: 'Regime de contratação (CLT, PJ)', example: 'CLT' })
  @IsString()
  @IsNotEmpty({ message: 'Tipo de contrato é obrigatório.' })
  contractType!: string;

  @ApiProperty({ name: 'workMode', description: 'Modelo de trabalho', example: 'Presencial' })
  @IsString()
  @IsNotEmpty({ message: 'Modalidade é obrigatória.' })
  workMode!: string;

  @ApiProperty({ name: 'availability', description: 'Disponibilidade para início', example: 'Imediata' })
  @IsString()
  @IsNotEmpty({ message: 'Disponibilidade é obrigatória.' })
  availability!: string;

  @ApiPropertyOptional({ name: 'message', description: 'Carta de apresentação ou resumo' })
  @IsOptional()
  @IsString()
  message?: string;

  // Campo documentado apenas para o Swagger (o arquivo real vem via Multipart/FormData)
  @ApiProperty({ type: 'string', format: 'binary', name: 'resumeFile', description: 'Currículo em PDF ou DOCX' })
  resumeFile: any;
}