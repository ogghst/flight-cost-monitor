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

import { UsersService } from '@/users/users.service.js'
import { AuthResponse, type AuthUser } from '@fcm/shared/auth'
import { type Request, type Response } from 'express'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
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
  register(@Body() data: RegisterDto) {
    return this.authService.register(data)
  }

  @Post('login')
  async login(
    @Body() data: LoginCredentialsUserDtoSwagger,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponse> {
    const result = await this.authService.login(data)

    // Set refresh token as HTTP-only cookie
    response.cookie('fcm_refresh_token', result.tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    // Return only access token and user info
    return {
      accessToken: result.tokenPair.accessToken,
      user: result.user,
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
  oauthLogin(@Body() data: LoginOAuthDtoSwagger) {
    return this.authService.oauthLogin(data)
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
  ): Promise<AuthResponse> {
    // try to get the token from the cookie
    const refreshToken = request.cookies['fcm_refresh_token']

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required')
    }

    // Get new tokens from auth service
    const result = await this.authService.refreshTokens(refreshToken)

    // Set the new refresh token as a cookie, just like in OAuth flow
    response.cookie('fcm_refresh_token', result.tokenPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    // Only return the access token in the response body
    return {
      accessToken: result.tokenPair.accessToken,
      user: result.user,
    }
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.cookies['fcm_refresh_token']

    if (refreshToken) {
      // Revoke the token in the database
      await this.authService.logout(refreshToken)
    }

    // Clear the refresh token cookie
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
    // Fetch full user data including roles
    const userData = await this.userService.findByEmail(user.email)

    if (!userData) {
      throw new NotFoundException('User not found')
    }

    return {
      ...userData,
      roles: userData.roles.map((role) => role.name),
    }
  }
}
