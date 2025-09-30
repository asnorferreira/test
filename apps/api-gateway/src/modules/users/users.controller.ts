import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../auth/jwt.guard'

@Controller('users')
export class UsersController {
  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: any) {
    return { user: req.user }
  }
}
