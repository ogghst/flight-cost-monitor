import { cookieConfig } from '@/common/cookies.js'
import { CryptoService } from '@/crypto/crypto.service.js'
import { InjectLogger } from '@/logging/index.js'
import { UserWithRelationsDtoSwagger } from '@/users/dto/user.dto.js'
import { UsersService } from '@/users/users.service.js'
import { JwtPayload } from '@fcm/shared/auth'
import { type Logger } from '@fcm/shared/logging'
import type { RefreshTokenRepository } from '@fcm/storage'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Response } from 'express'

/**
 * Service responsible for handling JWT token generation, validation, and management.
 * Handles both access tokens and refresh tokens, including token rotation and revocation.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REFRESH_TOKEN_REPOSITORY')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userService: UsersService,
    private readonly cryptoService: CryptoService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  /**
   * Generates a new pair of access and refresh tokens for a user.
   * Sets the refresh token as an HTTP-only cookie and returns the access token.
   *
   * @param user - The user to generate tokens for
   * @param response - Express response object to set cookies
   * @param currentRefreshToken - Optional current refresh token for token rotation
   * @param currentRefreshTokenExpiresAt - Optional expiration date of current refresh token
   * @returns Promise containing the access token string
   */
  async generateTokenPair(
    user: UserWithRelationsDtoSwagger,
    response: Response,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date
  ): Promise<string> {
    response.cookie(
      cookieConfig.refreshToken.name,
      await this.generateRefreshToken(
        user,
        currentRefreshToken,
        currentRefreshTokenExpiresAt
      ),
      cookieConfig.refreshToken.options
    )

    const accessToken = this.generateAccessToken({
      sub: user.email,
      roles: user.roles.map((r) => r.name),
    })

    return accessToken
  }

  /**
   * Generates a new JWT access token with user claims.
   *
   * @param payload - JWT payload containing user email and roles
   * @returns Promise containing signed JWT access token
   * @private
   */
  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    this.logger.debug('Generating access token', { payload })
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m', // Explicit 15 minutes expiration
    })
  }

  /**
   * Generates a new refresh token and stores it in the database.
   * Implements token rotation if a current refresh token is provided.
   *
   * @param user - User to generate refresh token for
   * @param currentRefreshToken - Optional current refresh token being rotated
   * @param currentRefreshTokenExpiresAt - Optional expiration of current token
   * @returns Promise containing the new refresh token string
   * @private
   */
  private async generateRefreshToken(
    user: UserWithRelationsDtoSwagger,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date
  ): Promise<string> {
    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.email, role: user.roles },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }
    )

    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      const hashedRefreshToken =
        this.cryptoService.generateSha256HashBase64(currentRefreshToken)
      if (await this.isRefreshTokenBlackListed(hashedRefreshToken)) {
        throw new UnauthorizedException('Invalid refresh token.')
      }

      await this.refreshTokenRepository.create({
        token: hashedRefreshToken,
        userEmail: user.email,
        expiresAt: currentRefreshTokenExpiresAt,
        family: 'refresh',
        generationNumber: 1,
        deletedAt: undefined,
        revoked: false,
        replacedByToken: '',
      })
    }

    return newRefreshToken
  }

  /**
   * Checks if a refresh token has been blacklisted (revoked).
   *
   * @param hashedRefreshToken - SHA256 hash of the refresh token
   * @returns Promise indicating if token is blacklisted
   * @private
   */
  private isRefreshTokenBlackListed(hashedRefreshToken: string) {
    return this.refreshTokenRepository.findByToken(hashedRefreshToken)
  }

  /**
   * Revokes a single refresh token.
   *
   * @param token - Refresh token to revoke
   */
  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(token)
  }

  /**
   * Revokes all refresh tokens for a specific user.
   * Used during logout or when user credentials are compromised.
   *
   * @param userId - ID of user whose tokens should be revoked
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    const tokens = await this.refreshTokenRepository.findByUserId(userId)
    await Promise.all(
      tokens.map((token) =>
        this.refreshTokenRepository.revokeToken(token.token)
      )
    )
  }

  /**
   * Clears expired refresh tokens from the database.
   * Runs daily at 6 AM.
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async clearExpiredRefreshTokens() {
    await this.refreshTokenRepository.deleteExpired()
  }
}
