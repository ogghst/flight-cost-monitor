import { UsersService } from '@/users/users.service.js'
import { AuthUser, JwtPayload } from '@fcm/shared/auth'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { toAuthUser } from '../auth.types.js'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userService.findByEmail(payload.sub)

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return toAuthUser(user)
  }
}
