import type { AuthSession, AuthUser } from '@fcm/shared'
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
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

import { extractRefreshTokenFromCookies } from '@/common/ccokies.js'
import { InjectLogger } from '@/logging/index.js'
import { UserWithRelationsDtoSwagger } from '@/users/dto/user.dto.js'
import { UsersService } from '@/users/users.service.js'
import { ConfigService } from '@nestjs/config'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { LoginCredentialsUserDtoSwagger } from '../dto/credential-login.dto.js'
import { LoginOAuthDtoSwagger } from '../dto/oauth-login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto.js'
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard.js'
import { JwtAuthGuard } from '../guards/jwt.guard.js'
import { AuthService } from '../services/auth.service.js'
import { TokenService } from '../services/token.service.js'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
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
  async register(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      // Register user and generate tokens
      const result = await this.authService.register(data)

      // Generate token pair using our token service
      await this.tokenService.generateTokenPair(result, response)

      return {
        user: result,
        message: 'Registration successful',
      }
    } catch (error) {
      this.logger.error('Error registering user', error)
      throw error
    }
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @Public()
  @Post('login')
  async login(
    @Body() credentials: LoginCredentialsUserDtoSwagger,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthSession> {
    try {
      this.logger.debug('Processing login request', {
        email: credentials.email,
      })

      // Authenticate user
      const user = await this.authService.login(credentials)

      // Generate tokens
      const tokens = await this.tokenService.generateTokenPair(user, response)

      return {
        user: {
          email: user.email,
          name: user.username,
          image: user.avatar,
          roles: user.roles.map((role) => role.name),
        },
        accessToken: tokens.accessToken,
      }
    } catch (error) {
      this.logger.error('Error during login', error)
      throw error
    }
  }

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
  ): Promise<AuthSession> {
    try {
      const user = await this.authService.oauthLogin(data)

      // Generate tokens
      const tokens = await this.tokenService.generateTokenPair(user, response)

      return {
        user: {
          email: user.email,
          name: user.username,
          image: user.avatar,
          roles: user.roles.map((role) => role.name),
        },
        accessToken: tokens.accessToken,
      }
    } catch (error) {
      this.logger.error('Error during login', error)
      throw error
    }
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @Throttle({
    short: { limit: 1, ttl: 1000 },
    long: { limit: 2, ttl: 60000 },
  })
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    try {
      this.logger.debug('Processing token refresh request')

      const refreshToken = extractRefreshTokenFromCookies(req)
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found')
      }

      if (!req.user) {
        throw new UnauthorizedException('User not found')
      }

      const user = req.user as UserWithRelationsDtoSwagger
      const accessToken = await this.tokenService.rotateTokens(
        refreshToken,
        user,
        res
      )

      return { accessToken }
    } catch (error) {
      this.logger.error('Error during token refresh', error)
      throw error
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  async logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required')
    }
    await this.authService.logout(refreshToken)
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
    await this.authService.resetPassword(data)
    return { message: 'Password reset successfully' }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile',
    type: UserWithRelationsDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getProfile(
    @CurrentUser() user: AuthUser
  ): Promise<UserWithRelationsDtoSwagger> {
    // Fetch full user data including roles
    const userData = await this.userService.findByEmail(user.email)
    if (!userData) {
      throw new NotFoundException('User not found')
    }

    return userData
  }
}
