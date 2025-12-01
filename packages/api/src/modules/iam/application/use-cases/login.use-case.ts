import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IIamRepository } from '../ports/i-iam.repository';
import { IHashingService } from '../../domain/services/i-hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { LoginSuccessResponse } from '../../presentation/responses/login-success.response';
import { ActiveUserData } from '../../infrastructure/authentication/strategies/jwt.strategy';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IIamRepository)
    private readonly iamRepository: IIamRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginSuccessResponse> {
    const user = await this.iamRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordMatch = await this.hashingService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: string;
  }) {
    const payload: ActiveUserData = {
      sub: user.id,
      email: user.email,
      role: user.role as any,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}