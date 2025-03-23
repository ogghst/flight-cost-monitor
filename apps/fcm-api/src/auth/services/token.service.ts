import { cookieConfig } from '@/common/ccokies.js'
import { CryptoService } from '@/crypto/crypto.service.js'
import { InjectLogger } from '@/logging/index.js'
import { UserWithRelationsDtoSwagger } from '@/users/dto/user.dto.js'
import { UsersService } from '@/users/users.service.js'
import type { RefreshTokenRepository } from '@fcm/storage'
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import type { RefreshTokenPayload, TokenPair } from '../auth.types.js'

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

      response.cookie(
        this.configService.get('JWT_REFRESH_NAME'),
        refreshToken,
        cookieConfig.refreshToken.options
      )

      return { accessToken, refreshToken }
    } catch (error) {
      this.logger.error('Token generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id,
      })
      throw new UnauthorizedException('Token generation failed')
    }
  }

  private async generateAccessToken(
    user: UserWithRelationsDtoSwagger
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: user.email,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      type: 'access',
    }

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    })
  }

  private async generateAndStoreRefreshToken(
    user: UserWithRelationsDtoSwagger,
    currentRefreshToken?: string,
    currentRefreshTokenExpiresAt?: Date
  ): Promise<string> {
    this.logger.debug('Generating refresh token', {
      userEmail: user.email,
      hasCurrentToken: !!currentRefreshToken,
    })

    // Create refresh token with standardized payload
    const payload: JwtPayload = {
      sub: user.email,
      roles: user.roles.map((r) => r.name),
      type: 'refresh',
      jti: this.cryptoService.generateUUID(),
    }

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH,
    })

    const hashedToken =
      this.cryptoService.generateSha256HashBase64(refreshToken)

    // Handle token rotation if we have a current token
    if (currentRefreshToken && currentRefreshTokenExpiresAt) {
      const hashedCurrentToken =
        this.cryptoService.generateSha256HashBase64(currentRefreshToken)
      const currentToken =
        await this.refreshTokenRepository.findByToken(hashedCurrentToken)

      // Create new token in the same family with incremented generation
      await this.refreshTokenRepository.create({
        token: hashedToken,
        userEmail: user.email,
        expiresAt: new Date(
          Date.now() + AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH * 1000
        ),
        family: currentToken?.family || 'refresh',
        generationNumber: (currentToken?.generationNumber || 0) + 1,
        revoked: false,
        replacedByToken: '',
        deletedAt: null,
      })
    } else {
      // Create new token family
      await this.refreshTokenRepository.create({
        token: hashedToken,
        userEmail: user.email,
        expiresAt: new Date(
          Date.now() + AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH * 1000
        ),
        family: `family_${this.cryptoService.generateUUID()}`,
        generationNumber: 1,
        revoked: false,
        replacedByToken: '',
        deletedAt: null,
      })
    }

    return refreshToken
  }

  async rotateTokens(
    currentRefreshToken: string,
    user: UserWithRelationsDtoSwagger,
    response: Response
  ): Promise<string> {
    try {
      const verifiedPayload = await this.verifyRefreshToken(currentRefreshToken)

      // Revoke the current refresh token
      const hashedCurrentToken =
        this.cryptoService.generateSha256HashBase64(currentRefreshToken)
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
        userId: user.id,
      })
      throw new UnauthorizedException('Token rotation failed')
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      // Verify JWT signature and expiration
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })

      // Check if token exists in database and is not revoked
      const hashedToken = this.cryptoService.generateSha256HashBase64(token)
      const storedToken =
        await this.refreshTokenRepository.findByToken(hashedToken)

      if (!storedToken || storedToken.revoked) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return payload
    } catch (error) {
      this.logger.error('Refresh token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify the token is valid
      const payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken)

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type')
      }

      // Check if token exists and is valid in database
      const tokenRecord =
        await this.refreshTokenRepository.findValidToken(refreshToken)

      if (!tokenRecord || tokenRecord.revoked) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      //get user info to get roles
      const userWithRel = await this.userService.findById(tokenRecord.userId)

      // Generate new token pair
      const newTokens = await this.generateTokenPair({
        sub: payload.sub,
        email: tokenRecord.user.email,
        roles: userWithRel.roles,
      })

      // Revoke the old refresh token
      await this.refreshTokenRepository.revokeToken(
        refreshToken,
        newTokens.refreshToken
      )

      return newTokens
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(token)
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const tokens = await this.refreshTokenRepository.findByUserId(userId)
    await Promise.all(
      tokens.map((token) =>
        this.refreshTokenRepository.revokeToken(token.token)
      )
    )
  }
}
