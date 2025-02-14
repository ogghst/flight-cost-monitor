import { cookieConfig } from '@/common/cookies.js'
import { CryptoService } from '@/crypto/crypto.service.js'
import { InjectLogger } from '@/logging/index.js'
import { REFRESH_TOKEN_REPOSITORY } from '@/storage/storage.tokens.js'
import { UserWithRelationsDtoSwagger } from '@/users/dto/user.dto.js'
import { 
  AuthErrorCode, 
  JwtPayload, 
  TokenError,
  validateTokenFormat,
  AUTH_CONSTANTS,
  getCookieConfig
} from '@fcm/shared/auth'
import { type Logger } from '@fcm/shared/logging'
import type { RefreshTokenRepository } from '@fcm/storage'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Response } from 'express'

interface TokenPair {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly cryptoService: CryptoService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  async generateTokenPair(
    user: UserWithRelationsDtoSwagger,
    response: Response,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date
  ): Promise<TokenPair> {
    try {
      // Generate new tokens
      const refreshToken = await this.generateAndStoreRefreshToken(
        user,
        currentRefreshToken,
        currentRefreshTokenExpiresAt
      )
      const accessToken = await this.generateAccessToken(user)

      // Validate both tokens before proceeding
      const refreshValidation = validateTokenFormat(refreshToken)
      const accessValidation = validateTokenFormat(accessToken)

      if (!refreshValidation.isValid || !accessValidation.isValid) {
        throw new TokenError(
          'Generated invalid tokens',
          AuthErrorCode.TOKEN_INVALID,
          { refresh: refreshValidation.error, access: accessValidation.error }
        )
      }

      // Set refresh token cookie using standardized config
      const isProd = this.configService.get('NODE_ENV') === 'production'
      const cookieConfig = getCookieConfig(isProd)
      
      response.cookie(
        AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN,
        refreshToken,
        cookieConfig.refreshToken.options
      )

      return { accessToken, refreshToken }
    } catch (error) {
      this.logger.error('Token generation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id 
      })
      throw new TokenError(
        'Failed to generate tokens',
        AuthErrorCode.TOKEN_INVALID
      )
    }
  }

  async rotateTokens(
    currentRefreshToken: string,
    user: UserWithRelationsDtoSwagger,
    response: Response
  ): Promise<string> {
    try {
      // First verify the current refresh token
      const verifiedPayload = await this.verifyRefreshToken(currentRefreshToken)
      
      if (verifiedPayload.sub !== user.email) {
        throw new TokenError(
          'Token subject mismatch',
          AuthErrorCode.TOKEN_INVALID
        )
      }

      // Revoke the current refresh token
      const hashedCurrentToken = this.cryptoService.generateSha256HashBase64(currentRefreshToken)
      await this.refreshTokenRepository.revokeToken(hashedCurrentToken)

      // Generate new token pair
      const { accessToken } = await this.generateTokenPair(
        user,
        response,
        currentRefreshToken,
        new Date(verifiedPayload.exp! * 1000)
      )

      return accessToken
    } catch (error) {
      this.logger.error('Token rotation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id 
      })
      throw new TokenError(
        'Failed to rotate tokens',
        AuthErrorCode.REFRESH_FAILED
      )
    }
  }

  private async generateAccessToken(
    user: UserWithRelationsDtoSwagger
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: user.email,
      roles: user.roles.map(r => r.name),
      type: 'access',
      jti: this.cryptoService.generateUUID()
    }

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.ACCESS
    })
  }

  private async generateAndStoreRefreshToken(
    user: UserWithRelationsDtoSwagger,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date
  ): Promise<string> {
    this.logger.debug('Generating refresh token', {
      userEmail: user.email,
      hasCurrentToken: !!currentRefreshToken
    })

    // Create refresh token with standardized payload
    const payload: JwtPayload = {
      sub: user.email,
      roles: user.roles.map(r => r.name),
      type: 'refresh',
      jti: this.cryptoService.generateUUID()
    }

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH
    })

    const hashedToken = this.cryptoService.generateSha256HashBase64(refreshToken)

    // Handle token rotation if we have a current token
    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      const hashedCurrentToken = this.cryptoService.generateSha256HashBase64(currentRefreshToken)
      const currentToken = await this.refreshTokenRepository.findByToken(hashedCurrentToken)
      
      // Create new token in the same family with incremented generation
      await this.refreshTokenRepository.create({
        token: hashedToken,
        userEmail: user.email,
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH * 1000),
        family: currentToken?.family || 'refresh',
        generationNumber: (currentToken?.generationNumber || 0) + 1,
        revoked: false,
        replacedByToken: '',
        deletedAt: null
      })
    } else {
      // Create new token family
      await this.refreshTokenRepository.create({
        token: hashedToken,
        userEmail: user.email,
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH * 1000),
        family: `family_${this.cryptoService.generateUUID()}`,
        generationNumber: 1,
        revoked: false,
        replacedByToken: '',
        deletedAt: null
      })
    }

    return refreshToken
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      // First validate token format
      const validation = validateTokenFormat(token)
      if (!validation.isValid) {
        throw new TokenError(
          'Invalid refresh token format',
          AuthErrorCode.TOKEN_INVALID,
          validation.error
        )
      }

      // Verify JWT signature and expiration
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      })

      // Verify token type
      if (payload.type !== 'refresh') {
        throw new TokenError(
          'Invalid token type',
          AuthErrorCode.TOKEN_INVALID
        )
      }

      // Check if token exists in database and is not revoked
      const hashedToken = this.cryptoService.generateSha256HashBase64(token)
      const storedToken = await this.refreshTokenRepository.findByToken(hashedToken)

      if (!storedToken || storedToken.revoked) {
        throw new TokenError(
          'Token has been revoked',
          AuthErrorCode.TOKEN_INVALID
        )
      }

      return payload
    } catch (error) {
      this.logger.error('Refresh token verification failed', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      if (error instanceof TokenError) {
        throw error
      }
      
      throw new TokenError(
        'Invalid refresh token',
        AuthErrorCode.TOKEN_INVALID
      )
    }
  }

  async revokeAllUserTokens(userEmail: string): Promise<void> {
    try {
      const tokens = await this.refreshTokenRepository.findByUserEmail(userEmail)
      await Promise.all(
        tokens.map(token => this.refreshTokenRepository.revokeToken(token.token))
      )
    } catch (error) {
      this.logger.error('Failed to revoke user tokens', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userEmail
      })
      throw error
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearExpiredRefreshTokens() {
    try {
      const count = await this.refreshTokenRepository.deleteExpired()
      this.logger.debug(`Cleared ${count} expired refresh tokens`)
    } catch (error) {
      this.logger.error('Failed to clear expired tokens', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
