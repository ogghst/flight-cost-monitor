import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UnauthorizedException
} from '@nestjs/common'
import { AuthService } from '../services/auth.service.js'
import { JwtAuthGuard } from '../guards/jwt.guard.js'
import { LoginDto } from '../dto/login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'
import { OAuthLoginDto } from '../dto/oauth-login.dto.js'
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/reset-password.dto.js'
import { Public } from '../decorators/public.decorator.js'
import { CurrentUser } from '../decorators/user.decorator.js'
import type { AuthUser } from '../auth.types.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data)
  }

  @Public()
  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data)
  }

  @Public()
  @Post('oauth/login')
  oauthLogin(@Body() data: OAuthLoginDto) {
    return this.authService.oauthLogin(data)
  }

  @Public()
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required')
    }
    return this.authService.refreshTokens(refreshToken)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required')
    }
    await this.authService.logout(refreshToken)
    return { message: 'Logged out successfully' }
  }

  @Public()
  @Post('password/reset-request')
  async requestPasswordReset(@Body() data: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(data)
    return { message: 'If the email exists, a reset link will be sent' }
  }

  @Public()
  @Post('password/reset')
  async resetPassword(@Body() data: ResetPasswordDto) {
    await this.authService.resetPassword(data)
    return { message: 'Password reset successfully' }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthUser) {
    return user
  }
}