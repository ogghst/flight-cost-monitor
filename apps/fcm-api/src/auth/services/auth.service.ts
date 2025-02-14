import { InjectLogger } from '@/logging/index.js'
import { UsersService } from '@/users/users.service.js'
import { AuthUserWithTokens } from '@fcm/shared/auth'
import { type Logger } from '@fcm/shared/logging'
import { AuthType, OAuthProvider } from '@fcm/shared/types'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import bcryptjs from 'bcryptjs'
import { randomBytes } from 'crypto'
import { Response } from 'express'
import { toAuthUser } from '../auth.types.js'
import { LoginCredentialsUserDtoSwagger } from '../dto/credential-login.dto.js'
import { LoginOAuthDtoSwagger } from '../dto/oauth-login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto.js'
import { TokenService } from './token.service.js'
const { hash, compare } = bcryptjs

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  async register(
    data: RegisterDto,
    response: Response
  ): Promise<AuthUserWithTokens> {
    // Check for existing user
    const existingUser = await this.userService.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictException('User already exists')
    }

    // Create new user
    const user = await this.userService.createWithCredentials({
      ...data,
      password: await hash(data.password, 10),
      active: true,
      authType: AuthType.CREDENTIAL,
    })

    // Generate tokens
    const { accessToken } = await this.tokenService.generateTokenPair(
      user,
      response
    )

    return {
      accessToken,
      user: toAuthUser(user),
    }
  }

  async login(
    credentials: LoginCredentialsUserDtoSwagger,
    response: Response
  ): Promise<AuthUserWithTokens> {
    // Validate credentials
    const user = await this.validateCredentials(credentials)

    // Update last login
    await this.userService.updateLastLogin(user.id)

    // Generate tokens
    const { accessToken } = await this.tokenService.generateTokenPair(
      user,
      response
    )

    return {
      accessToken,
      user: toAuthUser(user),
    }
  }

  async oauthLogin(
    data: LoginOAuthDtoSwagger,
    response: Response
  ): Promise<AuthUserWithTokens> {
    // Verify OAuth token
    await this.verifyOAuthToken(data)

    // Find or create user
    let user = await this.userService.findByOAuth(
      data.oauthProvider,
      data.oauthProviderId
    )

    if (!user) {
      user = await this.userService.createWithOAuth(data)
    }

    // Update last login
    await this.userService.updateLastLogin(user.id)

    // Generate tokens
    const { accessToken } = await this.tokenService.generateTokenPair(
      user,
      response
    )

    return {
      accessToken,
      user: toAuthUser(user),
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken)
      await this.tokenService.revokeAllUserTokens(payload.sub)
    } catch (error) {
      this.logger.warn('Logout attempted with invalid refresh token', { error })
    }
  }

  async refreshTokens(
    refreshToken: string,
    response: Response
  ): Promise<AuthUserWithTokens> {
    try {
      // Verify refresh token and get payload
      const payload = await this.tokenService.verifyRefreshToken(refreshToken)

      // Get user
      const user = await this.userService.findByEmail(payload.sub)
      if (!user || !user.active) {
        throw new UnauthorizedException('User not found or inactive')
      }

      // Rotate tokens
      const accessToken = await this.tokenService.rotateTokens(
        refreshToken,
        user,
        response
      )

      return {
        accessToken,
        user: toAuthUser(user),
      }
    } catch (error) {
      this.logger.error('Token refresh failed', { error })
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async requestPasswordReset(data: RequestPasswordResetDto): Promise<void> {
    const user = await this.userService.findByEmail(data.email)
    if (!user) {
      // Return silently to prevent user enumeration
      return
    }

    const token = randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await this.userService.setResetToken(user.id, token, expires)
    // TODO: Send password reset email
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findByResetToken(data.token)
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    await this.userService.update(user.id, {
      password: await hash(data.password, 10),
    })
    await this.userService.clearResetToken(user.id)

    // Revoke all tokens as security measure
    await this.tokenService.revokeAllUserTokens(user.email)
  }

  private async validateCredentials(
    credentials: LoginCredentialsUserDtoSwagger
  ) {
    const user = await this.userService.findByEmail(credentials.email)
    if (!user || !user.password || !user.active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await compare(credentials.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }

  private async verifyOAuthToken(data: LoginOAuthDtoSwagger): Promise<void> {
    switch (data.oauthProvider) {
      case OAuthProvider.GITHUB:
        await this.verifyGithubToken(data.accessToken)
        break
      case OAuthProvider.GOOGLE:
        await this.verifyGoogleToken(data.accessToken)
        break
      default:
        throw new BadRequestException('Unsupported OAuth provider')
    }
  }

  private async verifyGithubToken(token: string): Promise<void> {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new UnauthorizedException('Invalid GitHub token')
    }
  }

  private async verifyGoogleToken(token: string): Promise<void> {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
    )

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google token')
    }
  }
}
