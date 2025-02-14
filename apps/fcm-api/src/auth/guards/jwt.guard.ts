import { cookieConfig } from '@/common/cookies.js'
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js'
import { TokenService } from '../services/token.service.js'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    try {
      const canActivate = await super.canActivate(context)
      if (!canActivate) {
        return false
      }
      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const request = context.switchToHttp().getRequest()
        const refreshToken = request.cookies[cookieConfig.refreshToken.name]

        if (refreshToken) {
          try {
            const response = context.switchToHttp().getResponse()
            const request = context.switchToHttp().getRequest()
            const accessToken = await this.tokenService.rotateTokens(
              refreshToken,
              request.user,
              response
            )
            // Update request with new token
            request.headers.authorization = `Bearer ${accessToken}`
            return (await super.canActivate(context)) as boolean
          } catch (refreshError) {
            throw new UnauthorizedException('Session expired')
          }
        }
      }
      throw error
    }
  }
}
