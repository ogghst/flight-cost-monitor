import type { AuthUser } from '@fcm/shared'
import type { UserRepository } from '@fcm/storage'
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
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
import { CurrentUser } from '../decorators/user.decorator.js'
import { AuthUserDto } from '../dto/auth-user.dto.js'
import { JwtAuthGuard } from '../guards/jwt.guard.js'
import { AuthService } from '../services/auth.service.js'
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/reset-password.dto.js'
import { Public } from '../decorators/public.decorator.js'
import { OAuthLoginDto } from '../dto/oauth-login.dto.js'
import { LoginDto } from '../dto/login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('USER_REPOSITORY') private readonly userRepository: UserRepository
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

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with username/email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  login(@Body() data: LoginDto) {
    return this.authService.login(data)
  }

  @Public()
  @Post('oauth/login')
  @ApiOperation({ summary: 'Login with OAuth provider' })
  @ApiBody({ type: OAuthLoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in with OAuth',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid OAuth data',
  })
  oauthLogin(@Body() data: OAuthLoginDto) {
    return this.authService.oauthLogin(data)
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
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
    description: 'New access token generated',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required')
    }
    return this.authService.refreshTokens(refreshToken)
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
    type: AuthUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getProfile(@CurrentUser() user: AuthUser): Promise<AuthUserDto> {
    // Fetch full user data including roles
    const userData = await this.userRepository.findById(user.id)
    if (!userData) {
      throw new NotFoundException('User not found')
    }

    // Convert to AuthUserDto
    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roles: userData.roles.map((role) => role.name),
      authType: userData.authType,
      oauthProvider: userData.oauthProvider,
      profile: userData.oauthProfile,
      image: userData.image,
    }
  }
}
