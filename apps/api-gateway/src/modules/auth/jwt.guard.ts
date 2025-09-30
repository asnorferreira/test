import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authorization = (request.headers['authorization'] || '') as string
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : undefined

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      request.user = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
      return true
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
