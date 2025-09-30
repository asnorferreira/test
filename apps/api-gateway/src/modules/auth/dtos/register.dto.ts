import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email!: string

  @IsNotEmpty()
  tenantSlug!: string

  @MinLength(6)
  password!: string

  @IsOptional()
  @IsNotEmpty()
  displayName?: string
}
