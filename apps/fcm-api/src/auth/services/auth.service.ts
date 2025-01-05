import { AuthType, OAuthProvider } from '@fcm/shared'
import type { UserRepository } from '@fcm/storage'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'
import { randomBytes } from 'crypto'
import type { AuthResponse, JwtPayload } from '../auth.types.js'
import { LoginDto } from '../dto/login.dto.js'
import { OAuthLoginDto } from '../dto/oauth-login.dto.js'
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
    @Inject('USER_REPOSITORY') private readonly userRepository: UserRepository
  ) {}

  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictException('User already exists')
    }

    // Create user with hashed password
    const user = await this.userRepository.createCredentialsUser({
      ...data,
      password: await hash(data.password, 10),
      active: true,
      authType: AuthType.CREDENTIAL,
    })

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    })

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
        authType: user.authType,
      },
    }
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email or username
    const user = await (data.username.includes('@')
      ? this.userRepository.findByEmail(data.username)
      : this.userRepository.findByUsername(data.username))

    if (!user || !user.password || !user.active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id)

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    })

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
        authType: user.authType,
      },
    }
  }

  async oauthLogin(data: OAuthLoginDto): Promise<AuthResponse> {
    // Verify the OAuth token with provider
    const verifiedData = await this.verifyOAuthToken(data)

    // Find or create user
    let user = await this.userRepository.findByOAuth(
      data.provider,
      data.providerId
    )

    if (!user) {
      // Create new OAuth user
      user = await this.userRepository.createOAuthUser({
        email: verifiedData.email,
        oauthProvider:
          data.provider === OAuthProvider.GITHUB
            ? OAuthProvider.GITHUB
            : OAuthProvider.GOOGLE,
        oauthProviderId: data.providerId,
        firstName: data.firstName,
        lastName: data.lastName,
        oauthProfile: JSON.stringify({
          avatar: data.avatar,
          ...verifiedData,
        }),
        active: true,
        authType: AuthType.OAUTH,
      })
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id)

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    })

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
        authType: user.authType,
      },
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeToken(refreshToken)
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    const tokens = await this.tokenService.refreshTokens(refreshToken)

    // Decode the new access token to get user ID
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      tokens.accessToken
    )
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload')
    }

    // Get fresh user data
    const user = await this.userRepository.findById(payload.sub)
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive')
    }

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.name),
        authType: user.authType,
      },
    }
  }

  async requestPasswordReset({
    email,
  }: RequestPasswordResetDto): Promise<void> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    await this.userRepository.setResetToken(user.id, token, expires)

    // TODO: Send reset email
  }

  async resetPassword({ token, password }: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findByResetToken(token)
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    // Update password and clear reset token
    await this.userRepository.update(user.id, {
      password: await hash(password, 10),
    })
    await this.userRepository.clearResetToken(user.id)

    // Revoke all refresh tokens for security
    await this.tokenService.revokeAllUserTokens(user.id)
  }

  private async verifyOAuthToken(data: OAuthLoginDto): Promise<any> {
    // Implement provider-specific token verification
    switch (data.provider) {
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
      throw new UnauthorizedException('Failed to verify GitHub token')
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
      throw new UnauthorizedException('Failed to verify Google token')
    }
  }
}
