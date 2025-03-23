import { UserWithRelationsDtoSwagger } from '@/users/dto/user.dto.js'
import { UsersService } from '@/users/users.service.js'
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
import type { AuthResponse } from '../auth.types.js'
import { LoginCredentialsUserDtoSwagger } from '../dto/credential-login.dto.js'
import { LoginCredentialsDtoSwagger } from '../dto/login.dto.js'
import { LoginOAuthDtoSwagger } from '../dto/oauth-login.dto.js'
import { RegisterDto } from '../dto/register.dto.js'
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto.js'
import { TokenService } from './token.service.js'

// Define missing interface
interface JwtPayload {
  sub: string
  email: string
  roles?: string[]
}

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) {}

  async register(data: RegisterDto): Promise<UserWithRelationsDtoSwagger> {
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

    return user
  }

  async login(
    credentials: LoginCredentialsDtoSwagger,
    response: Response
  ): Promise<UserWithRelationsDtoSwagger> {
    // Find user by email or username
    const user = await this.userService.findByEmail(credentials.email)

    if (!user || !user.password || !user.active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await compare(credentials.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Update last login
    await this.userService.updateLastLogin(user.id)

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user, response)

    return user
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeToken(refreshToken)
  }

  async oauthLogin(
    data: LoginOAuthDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    // Verify the OAuth token with provider
    const verifiedData = await this.verifyOAuthToken(data)

    // Find or create user
    let user = await this.userService.findByOAuth(
      data.oauthProvider,
      data.oauthProviderId
    )

    if (!user) {
      // Create new OAuth user
      user = await this.userService.createWithOAuth({
        email: data.email,
        oauthProvider: data.oauthProvider,
        oauthProviderId: data.oauthProviderId,
        active: true,
        authType: AuthType.OAUTH,
        oauthProfile: JSON.stringify(verifiedData),
      })
    }

    // Update last login
    await this.userService.updateLastLogin(user.id)

    return user
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
    const user = await this.userService.findById(payload.sub)
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive')
    }

    return {
      ...tokens,
      user: {
        email: user.email,
        username: user.username,
        roles: user.roles.map((r) => r.name),
      },
    }
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
    // TODO: In a real implementation, you would store this token
    // and its expiry somewhere, like in the database.
    // For now, just generate the token for the example.

    // TODO: Send reset email with the token
    console.log(`Password reset token for ${email}: ${token}`)
  }

  async resetPassword({ token, password }: ResetPasswordDto): Promise<void> {
    // TODO: In a real implementation, you would:
    // 1. Find the user by the reset token
    // 2. Check that the token hasn't expired
    // 3. Update the password and clear the token

    // For now, this method is just a placeholder for the implementation
    throw new BadRequestException(
      'Password reset functionality not implemented'
    )

    // Actual implementation would be something like:
    // const user = findUserByResetToken(token);
    // if (!user || tokenIsExpired(user.resetTokenExpires)) {
    //   throw new BadRequestException('Invalid or expired reset token');
    // }
    //
    // Update password
    // await this.userService.update(user.id, {
    //   password: await hash(password, 10),
    // });
    //
    // // Revoke all refresh tokens for security
    // await this.tokenService.revokeAllUserTokens(user.id);
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

  async validateCredentials(
    credentials: LoginCredentialsUserDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
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
}
