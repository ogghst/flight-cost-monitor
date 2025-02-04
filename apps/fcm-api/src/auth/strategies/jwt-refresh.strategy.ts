import { UsersService } from '@/users/users.service.js'
import { AuthUser, JwtPayload } from '@fcm/shared/auth'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { toAuthUser } from '../auth.types.js'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  private readonly userService: UsersService

  constructor(userService: UsersService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    })
    this.userService = userService
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userService.findByEmail(payload.sub)

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    const authUser = toAuthUser(user)

    return authUser
  }
}
