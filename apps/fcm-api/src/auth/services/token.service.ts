import { UsersService } from '@/users/users.service.js'
import { JwtPayload, TokenPair } from '@fcm/shared/auth'
import type { RefreshTokenRepository } from '@fcm/storage'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'crypto'
import ms from 'ms'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REFRESH_TOKEN_REPOSITORY')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userService: UsersService
  ) {}

  async generateTokenPair(sub: string): Promise<TokenPair> {
    const now = new Date()
    const iatTimestamp = Math.floor(now.getTime() / 1000) // Convert to seconds
    const tokenId = randomBytes(32).toString('hex')

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken({
        sub: sub,
        iat: iatTimestamp,
        type: 'access',
        jti: tokenId,
      }),
      this.generateRefreshToken(sub),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', 900),
    })
  }

  private async generateRefreshToken(userEmail: string): Promise<string> {
    const tokenId = randomBytes(32).toString('hex')
    const expiresIn = this.configService.get(
      'JWT_REFRESH_EXPIRATION',
      7 * 24 * 60 * 60
    )
    const family = randomBytes(32).toString('hex')

    const now = new Date()
    const iatTimestamp = Math.floor(now.getTime() / 1000) // Convert to seconds

    const token = await this.jwtService.signAsync(
      {
        sub: userEmail,
        jti: tokenId,
        type: 'refresh',
        iat: iatTimestamp,
        //exp: iatTimestamp + 15 * 60 * 1000,
        family: family,
      },
      {
        expiresIn,
      }
    )

    // Store refresh token in database
    await this.refreshTokenRepository.create({
      token,
      userEmail: userEmail,
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
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken)

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
      //const userWithRel = await this.userService.findById(tokenRecord.userId)

      // Generate new token pair
      const newTokens = await this.generateTokenPair(payload.sub)

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
