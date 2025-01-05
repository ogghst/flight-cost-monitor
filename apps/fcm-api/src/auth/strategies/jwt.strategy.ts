import { AuthUser } from '@fcm/shared'
import type { UserRepository } from '@fcm/storage'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../auth.types.js'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('USER_REPOSITORY') private readonly userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userRepository.findById(payload.sub)

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: payload.roles,
      authType: user.authType,
    }
  }
}
