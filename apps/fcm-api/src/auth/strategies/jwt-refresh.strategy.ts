import { extractRefreshTokenFromCookies } from '@/common/ccokies.js'
import { UsersService } from '@/users/users.service.js'
import { AuthUser } from '@fcm/shared'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => extractRefreshTokenFromCookies(req),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userService.findById(payload.sub)

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return {
      //id: user.id,
      email: user.email,
      username: user.username || undefined,
      //firstName: user.firstName,
      //lastName: user.lastName,
      roles: payload.roles,
    }
  }
}
