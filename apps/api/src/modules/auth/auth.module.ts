import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./application/use-cases/auth.service";
import { AuthController } from "./presentation/auth.controller";
import { JwtStrategy } from "./infra/jwt.strategy";
import { UsersModule } from "../users/users.module";
import { AuthEventsListener } from "./application/listeners/auth-events.listener";
import { Env } from "@/config/env.config";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get("JWT_SECRET", { infer: true }),
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthEventsListener],
})
export class AuthModule {}
