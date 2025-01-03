import { UsersService } from '@/users/users.service.js'
import type { RefreshTokenRepository } from '@fcm/storage'
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'crypto'
import ms from 'ms'
import type {
  JwtPayload,
  RefreshTokenPayload,
  TokenPair,
} from '../auth.types.js'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REFRESH_TOKEN_REPOSITORY') private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userService: UsersService
  ) {}

  async generateTokenPair(
    payload: Omit<JwtPayload, 'type'>
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload.sub),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  private async generateAccessToken(
    payload: Omit<JwtPayload, 'type'>
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        ...payload,
        type: 'access',
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
      }
    )
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = randomBytes(32).toString('hex')
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRATION', '7d')
    const family = randomBytes(32).toString('hex')

    const token = await this.jwtService.signAsync(
      {
        sub: userId,
        jti: tokenId,
        type: 'refresh',
      } as RefreshTokenPayload,
      {
        expiresIn,
      }
    )

    // Store refresh token in database
    await this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt: new Date(Date.now() + ms(expiresIn)),
      family,
      generationNumber: 1,
      deletedAt: undefined,
      revoked: false,
      replacedByToken: '',
    })

    return token
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