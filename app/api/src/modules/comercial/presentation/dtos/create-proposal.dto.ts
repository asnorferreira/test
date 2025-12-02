import { ApiProperty } from '@nestjs/swagger';
import { 
  IsArray, 
  IsEmail, 
  IsInt, 
  IsNotEmpty, 
  IsString, 
  Min,
  ArrayMinSize,
  IsOptional
} from 'class-validator';

export class CreateProposalDto {
  @ApiProperty({ example: 'Sofia Almeida', description: 'Nome do solicitante' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  fullName!: string;

  @ApiProperty({ example: 'Gerente de Facilities', description: 'Cargo do solicitante' })
  @IsString()
  @IsNotEmpty({ message: 'O cargo é obrigatório.' })
  position!: string;

  @ApiProperty({ example: 'sofia.almeida@empresa.com', description: 'E-mail corporativo' })
  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '(11) 99999-0000', description: 'Telefone de contato' })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  phone!: string;

  @ApiProperty({ example: 'Instituição Modelo S.A.', description: 'Nome da empresa' })
  @IsString()
  @IsNotEmpty({ message: 'A empresa é obrigatória.' })
  company!: string;

  @ApiProperty({ example: 'Arquitetura e Engenharia', description: 'Setor de atuação' })
  @IsString()
  @IsNotEmpty({ message: 'O setor é obrigatório.' })
  sector!: string;

  @ApiProperty({ 
    example: ['Arquitetura e Engenharia', 'Transporte e Logística'], 
    description: 'Serviços de interesse' 
  })
  @IsArray({ message: 'Os serviços devem ser enviados como uma lista.' })
  @IsString({ each: true, message: 'Cada serviço deve ser um texto.' })
  @ArrayMinSize(1, { message: 'Selecione pelo menos um serviço.' })
  services!: string[];

  @ApiProperty({ example: 50, description: 'Headcount estimado para terceirização' })
  @IsInt({ message: 'O headcount deve ser um número inteiro.' })
  @Min(1, { message: 'O headcount deve ser no mínimo 1.' })
  estimatedHeadcount!: number;

  @ApiProperty({ example: 'Preciso de suporte para coordenar obras...', description: 'Descrição da necessidade' })
  @IsOptional()
  @IsString()
  needsDescription?: string;
}