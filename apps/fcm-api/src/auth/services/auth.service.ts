import { UsersService } from '@/users/users.service.js'
import { AuthUserWithTokens, JwtPayload } from '@fcm/shared/auth'
import { AuthType, OAuthProvider } from '@fcm/shared/types'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'
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

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) {}

  async register(
    data: RegisterDto,
    response: Response
  ): Promise<AuthUserWithTokens> {
    // First check if user already exists to avoid duplicate registrations
    const existingUser = await this.userService.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictException('User already exists')
    }

    // Create new user with securely hashed password
    const user = await this.userService.createWithCredentials({
      ...data,
      password: await hash(data.password, 10),
      active: true,
      authType: AuthType.CREDENTIAL,
    })

    // Generate initial token pair (access + refresh tokens)
    const accessToken = await this.tokenService.generateTokenPair(
      user,
      response
    )

    return {
      accessToken,
      user: toAuthUser(user),
    }
  }

  async login(
    loginCredentials: LoginCredentialsUserDtoSwagger,
    response: Response
  ): Promise<AuthUserWithTokens> {
    // Validate user exists and is active
    const user = await this.userService.findByEmail(loginCredentials.email)
    if (!user || !user.password || !user.active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password using secure comparison
    const isPasswordValid = await compare(
      loginCredentials.password,
      user.password
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Update last login timestamp for user activity tracking
    await this.userService.updateLastLogin(user.id)

    // Generate new token pair for the session
    const accessToken = await this.tokenService.generateTokenPair(
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
    // First verify the OAuth token with the provider
    await this.verifyOAuthToken(data)

    // Find existing user or create new one for OAuth login
    let user = await this.userService.findByOAuth(
      data.oauthProvider,
      data.oauthProviderId
    )

    if (!user) {
      user = await this.userService.createWithOAuth(data)
    }

    // Update last login timestamp
    await this.userService.updateLastLogin(user.id)

    // Generate new token pair for the session
    const accessToken = await this.tokenService.generateTokenPair(
      user,
      response
    )

    return {
      accessToken,
      user: toAuthUser(user),
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // Revoke the refresh token to prevent its reuse
    await this.tokenService.revokeToken(refreshToken)
  }

  async refreshTokens(
    refreshToken: string,
    response: Response
  ): Promise<AuthUserWithTokens> {
    try {
      // Verify the refresh token using the correct secret
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        }
      )

      // Validate user still exists and is active
      const user = await this.userService.findByEmail(payload.sub)
      if (!user || !user.active) {
        throw new UnauthorizedException('User not found or inactive')
      }

      // Generate new token pair, passing the current refresh token for rotation
      const accessToken = await this.tokenService.generateTokenPair(
        user,
        response,
        refreshToken
      )

      return {
        accessToken,
        user: toAuthUser(user),
      }
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed', error)
    }
  }

  async requestPasswordReset({
    email,
  }: RequestPasswordResetDto): Promise<void> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      // Return silently to prevent user enumeration
      return
    }

    // Generate secure reset token
    const token = randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // 1 hour expiration

    await this.userService.setResetToken(user.id, token, expires)

    // TODO: Implement email sending logic
  }

  async resetPassword({ token, password }: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findByResetToken(token)
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    // Update password with new hash and clear reset token
    await this.userService.update(user.id, {
      password: await hash(password, 10),
    })
    await this.userService.clearResetToken(user.id)

    // Revoke all refresh tokens as a security measure
    await this.tokenService.revokeAllUserTokens(user.id)
  }

  private async verifyOAuthToken(data: LoginOAuthDtoSwagger): Promise<any> {
    switch (data.oauthProvider) {
      case OAuthProvider.GITHUB:
        return this.verifyGithubToken(data.accessToken)
      case OAuthProvider.GOOGLE:
        return this.verifyGoogleToken(data.accessToken)
      default:
        throw new BadRequestException('Unsupported OAuth provider')
    }
  }

  private async verifyGithubToken(token: string): Promise<any> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new UnauthorizedException('Invalid GitHub token')
      }
      return response.json()
    } catch (error) {
      throw new UnauthorizedException('Failed to verify GitHub token: ' + error)
    }
  }

  private async verifyGoogleToken(token: string): Promise<any> {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
      )
      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google token')
      }
      return response.json()
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Google token: ' + error)
    }
  }
}
