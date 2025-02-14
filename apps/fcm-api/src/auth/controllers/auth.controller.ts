import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Public } from '../decorators/public.decorator.js'
import { CurrentUser } from '../decorators/user.decorator.js'
import { JwtAuthGuard } from '../guards/jwt.guard.js'
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard.js'

import { extractRefreshTokenFromCookies } from '@/common/cookies.js'
import { InjectLogger } from '@/logging/index.js'
import { UserWithRelationsDtoSwagger } from '@/users/dto/user.dto.js'
import { UsersService } from '@/users/users.service.js'
import { 
  AuthErrorCode,
  AuthErrorResponse,
  AuthMeResponse,
  AuthSession,
  TokenError,
  validateTokenFormat
} from '@fcm/shared/auth'
import { type Logger } from '@fcm/shared/logging'
import { ConfigService } from '@nestjs/config'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from '../services/auth.service.js'
import { TokenService } from '../services/token.service.js'
import { LoginCredentialsUserDtoSwagger } from '../dto/credential-login.dto.js'
import { LoginOAuthDtoSwagger } from '../dto/oauth-login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/reset-password.dto.js'

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
      await this.tokenService.generateTokenPair(result.user, response)
      
      return {
        user: result.user,
        message: 'Registration successful'
      }
    } catch (error) {
      this.handleAuthError(error)
    }
  }

  @Throttle({
    short: { limit: 2, ttl: 1000 },
    long: { limit: 5, ttl: 60000 },
  })
  @Public()
  @Post('login')
  async login(
    @Body() credentials: LoginCredentialsDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthSession> {
    try {
      this.logger.debug('Processing login request', { 
        email: credentials.email 
      })

      // Authenticate user
      const user = await this.authService.validateUser(
        credentials.email,
        credentials.password
      )

      // Generate tokens
      const tokens = await this.tokenService.generateTokenPair(user, response)

      // Validate access token before sending
      const validation = validateTokenFormat(tokens.accessToken)
      if (!validation.isValid) {
        throw new TokenError(
          'Generated invalid access token',
          AuthErrorCode.TOKEN_INVALID
        )
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles.map(r => r.name),
          name: user.username || undefined
        },
        accessToken: tokens.accessToken
      }
    } catch (error) {
      this.handleAuthError(error)
    }
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ accessToken: string }> {
    try {
      this.logger.debug('Processing token refresh request')

      const refreshToken = extractRefreshTokenFromCookies(request)
      if (!refreshToken) {
        throw new TokenError(
          'No refresh token provided',
          AuthErrorCode.TOKEN_MISSING
        )
      }

      if (!request.user) {
        throw new TokenError(
          'No user found in refresh token',
          AuthErrorCode.TOKEN_INVALID
        )
      }

      const user = request.user as UserWithRelationsDtoSwagger
      const accessToken = await this.tokenService.rotateTokens(
        refreshToken,
        user,
        response
      )

      return { accessToken }
    } catch (error) {
      this.handleAuthError(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  async getProfile(@CurrentUser() user: UserWithRelationsDtoSwagger): Promise<AuthMeResponse> {
    try {
      this.logger.debug('Retrieving user profile', { 
        userId: user.id 
      })

      const userData = await this.userService.findByEmail(user.email)
      if (!userData) {
        throw new TokenError(
          'User not found',
          AuthErrorCode.USER_NOT_FOUND
        )
      }

      return {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        roles: userData.roles.map(r => r.name),
        preferences: userData.preferences
      }
    } catch (error) {
      this.handleAuthError(error)
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: UserWithRelationsDtoSwagger,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      this.logger.debug('Processing logout request', { 
        userId: user.id 
      })

      // Revoke all refresh tokens for the user
      await this.tokenService.revokeAllUserTokens(user.email)

      // Clear refresh token cookie
      response.clearCookie('fcm_refresh_token', {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/'
      })

      return { message: 'Logged out successfully' }
    } catch (error) {
      this.handleAuthError(error)
    }
  }

  private handleAuthError(error: unknown): never {
    if (error instanceof TokenError) {
      // Convert TokenError to standardized error response
      const errorResponse: AuthErrorResponse = {
        code: error.code,
        message: error.message,
        details: error.details
      }
      
      // Log the error with context
      this.logger.error('Authentication error', errorResponse)

      // Determine appropriate HTTP status
      const statusCode = this.getHttpStatusForErrorCode(error.code)
      throw new HttpException(errorResponse, statusCode)
    }

    // Handle unexpected errors
    this.logger.error('Unexpected authentication error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw new HttpException(
      {
        code: AuthErrorCode.TOKEN_INVALID,
        message: 'Authentication failed'
      },
      HttpStatus.UNAUTHORIZED
    )
  }

  private getHttpStatusForErrorCode(code: AuthErrorCode): number {
    switch (code) {
      case AuthErrorCode.TOKEN_EXPIRED:
      case AuthErrorCode.TOKEN_INVALID:
      case AuthErrorCode.TOKEN_MISSING:
        return HttpStatus.UNAUTHORIZED
      case AuthErrorCode.USER_NOT_FOUND:
        return HttpStatus.NOT_FOUND
      case AuthErrorCode.INVALID_CREDENTIALS:
        return HttpStatus.UNAUTHORIZED
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR
    }
  }
}
