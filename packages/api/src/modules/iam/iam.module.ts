import { Module } from '@nestjs/common';
import { IamController } from './infrastructure/iam.controller';
import { IIamRepository } from './application/ports/i-iam.repository';
import { IamRepository } from './infrastructure/adapters/iam.repository';
import { IHashingService } from './domain/services/i-hashing.service';
import { BcryptService } from './infrastructure/authentication/hashing/bcrypt.service';
import { RegisterCandidateUseCase } from './application/use-cases/register-candidate.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './infrastructure/authentication/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './infrastructure/authentication/guards/jwt-auth.guard';
import { CreateStaffUserUseCase } from './application/use-cases/create-staff-user.use-case';
import { EventEmitterModule } from '@nestjs/event-emitter';

const useCases = [
  RegisterCandidateUseCase,
  LoginUseCase,
  CreateStaffUserUseCase,
];

const services = [
  { provide: IHashingService, useClass: BcryptService },
  { provide: IIamRepository, useClass: IamRepository },
  JwtStrategy,
];

@Module({
  imports: [
    PassportModule,
    ConfigModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
    }),

    EventEmitterModule.forRoot(),
  ],
  controllers: [IamController],
  providers: [
    ...useCases,
    ...services,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [IHashingService, IIamRepository],
})
export class IamModule {}