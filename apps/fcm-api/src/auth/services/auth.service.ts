import { UsersService } from '@/users/users.service.js'
import { AuthResponse, AuthUserWithTokens, JwtPayload } from '@fcm/shared/auth'
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

  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userService.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictException('User already exists')
    }

    // Create user with hashed password
    const user = await this.userService.createWithCredentials({
      ...data,
      password: await hash(data.password, 10),
      active: true,
      authType: AuthType.CREDENTIAL,
    })

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user.email)

    return {
      ...tokens,
      user: toAuthUser(user),
    }
  }

  async login(
    data: LoginCredentialsUserDtoSwagger
  ): Promise<AuthUserWithTokens> {
    // Find user by email or username
    const user = await this.userService.findByEmail(data.email)

    if (!user || !user.password || !user.active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Update last login
    await this.userService.updateLastLogin(user.id)

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user.email)

    const ret: AuthUserWithTokens = {
      tokenPair: tokens,
      user: toAuthUser(user),
    }

    return ret
  }

  async oauthLogin(data: LoginOAuthDtoSwagger): Promise<AuthUserWithTokens> {
    // Verify the OAuth token with provider
    await this.verifyOAuthToken(data)

    // Find or create user
    let user = await this.userService.findByOAuth(
      data.oauthProvider,
      data.oauthProviderId
    )

    if (!user) {
      // Create new OAuth user
      user = await this.userService.createWithOAuth(data)
    }

    // Update last login
    await this.userService.updateLastLogin(user.id)

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user.email)

    return {
      tokenPair: tokens,
      user: toAuthUser(user),
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeToken(refreshToken)
  }

  async refreshTokens(refreshToken: string): Promise<AuthUserWithTokens> {
    const tokens = await this.tokenService.refreshTokens(refreshToken)

    // Decode the new access token to get user ID
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      tokens.accessToken
    )
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload')
    }

    // Get fresh user data
    const user = await this.userService.findById(payload.sub)
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive')
    }

    const ret: AuthUserWithTokens = {
      tokenPair: tokens,
      user: toAuthUser(user),
    }

    return ret
  }

  async requestPasswordReset({
    email,
  }: RequestPasswordResetDto): Promise<void> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    await this.userService.setResetToken(user.id, token, expires)

    // TODO: Send reset email
  }

  async resetPassword({ token, password }: ResetPasswordDto): Promise<void> {
    const user = await this.userService.findByResetToken(token)
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    // Update password and clear reset token
    await this.userService.update(user.id, {
      password: await hash(password, 10),
    })
    await this.userService.clearResetToken(user.id)

    // Revoke all refresh tokens for security
    await this.tokenService.revokeAllUserTokens(user.id)
  }

  private async verifyOAuthToken(data: LoginOAuthDtoSwagger): Promise<any> {
    // Implement provider-specific token verification
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
