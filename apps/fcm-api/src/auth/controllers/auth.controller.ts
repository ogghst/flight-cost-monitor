import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../decorators/public.decorator.js'
import { CurrentUser } from '../decorators/user.decorator.js'
import { AuthUserDtoSwagger } from '../dto/auth-user.dto.js'
import { LoginCredentialsUserDtoSwagger } from '../dto/credential-login.dto.js'
import { LoginOAuthDtoSwagger } from '../dto/oauth-login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto.js'
import { AuthService } from '../services/auth.service.js'

import { extractRefreshTokenFromCookies } from '@/common/cookies.js'
import { InjectLogger } from '@/logging/index.js'
import { UsersService } from '@/users/users.service.js'
import { AuthUserWithTokens, type AuthUser } from '@fcm/shared/auth'
import { type Logger } from '@fcm/shared/logging'
import { Throttle } from '@nestjs/throttler'
import { type Request, type Response } from 'express'
import { TokenService } from '../services/token.service.js'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly refreshTokenService: TokenService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username/email already exists',
  })
  register(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.register(data, response)
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @Public()
  @Post('login')
  @ApiBody({ type: LoginCredentialsUserDtoSwagger })
  async login(
    @Body() loginCredentials: LoginCredentialsUserDtoSwagger,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthUserWithTokens> {
    this.logger.debug('Login request received', { loginCredentials })

    const result = await this.authService.login(loginCredentials, response)
    return result
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @Public()
  @Post('oauth/login')
  @ApiOperation({ summary: 'Login with OAuth provider' })
  @ApiBody({ type: LoginOAuthDtoSwagger })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in with OAuth',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid OAuth data',
  })
  async oauthLogin(
    @Body() data: LoginOAuthDtoSwagger,
    @Res({ passthrough: true }) response: Response
  ) {
    this.logger.debug('OAuth login request received', { data })
    const result = await this.authService.oauthLogin(data, response)
    return result
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access token generated',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthUserWithTokens> {
    this.logger.debug('Token refresh requested', {
      cookies: request.headers.cookie,
    })

    const refreshToken = extractRefreshTokenFromCookies(request)
    
    if (!refreshToken) {
      this.logger.error('No refresh token found in request')
      throw new UnauthorizedException('No refresh token provided')
    }

    try {
      const result = await this.authService.refreshTokens(refreshToken, response)
      this.logger.debug('Token refresh successful')
      return result
    } catch (error) {
      this.logger.error('Token refresh failed', { error })
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    this.logger.debug('Logout request received')

    const refreshToken = request.cookies['fcm_refresh_token']

    if (refreshToken) {
      await this.authService.logout(refreshToken)
    }

    response.clearCookie('fcm_refresh_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return { message: 'Logged out successfully' }
  }

  @Public()
  @Post('password/reset-request')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reset email sent if account exists',
  })
  async requestPasswordReset(@Body() data: RequestPasswordResetDto) {
    this.logger.debug('Password reset requested for', { email: data.email })
    await this.authService.requestPasswordReset(data)
    return { message: 'If the email exists, a reset link will be sent' }
  }

  @Public()
  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() data: ResetPasswordDto) {
    this.logger.debug('Password reset attempt')
    await this.authService.resetPassword(data)
    return { message: 'Password reset successfully' }
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile',
    type: AuthUserDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getProfile(@CurrentUser() user: AuthUser): Promise<AuthUserDtoSwagger> {
    this.logger.debug('Profile request received for user', { email: user.email })

    const userData = await this.userService.findByEmail(user.email)

    if (!userData) {
      throw new NotFoundException('User not found')
    }

    return {
      ...userData,
      roles: userData.roles.map((r) => r.name),
    }
  }
}