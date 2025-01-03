import { Prisma } from '@prisma/client'
import type { RefreshToken } from '../schema/refresh-token.js'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient } from './prisma.js'

export class RefreshTokenRepository {
  private prisma = fcmPrismaClient

  private mapPrismaToRefreshToken(prismaToken: any): RefreshToken {
    const token = {
      id: prismaToken.id,
      token: prismaToken.token,
      userId: prismaToken.userId,
      expiresAt: new Date(prismaToken.expiresAt),
      revoked: prismaToken.revoked,
      replacedByToken: prismaToken.replacedByToken,
      family: prismaToken.family,
      generationNumber: prismaToken.generationNumber,
      createdAt: new Date(prismaToken.createdAt),
      updatedAt: new Date(prismaToken.updatedAt),
      deletedAt: prismaToken.deletedAt ? new Date(prismaToken.deletedAt) : null,
    }

    if (prismaToken.user) {
      return {
        ...token,
        user: prismaToken.user,
      }
    }

    return token
  }

  async create(
    data: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>,
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken> {
    const client = tx || this.prisma
    try {
      const { user, ...tokenData } = data
      const token = await client.refreshToken.create({ data: tokenData })
      return this.mapPrismaToRefreshToken(token)
    } catch (error) {
      throw new DatabaseError('Failed to create refresh token', error)
    }
  }

  async findByToken(
    token: string,
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken | null> {
    const client = tx || this.prisma
    try {
      const refreshToken = await client.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      })
      return refreshToken
        ? (this.mapPrismaToRefreshToken(refreshToken) as RefreshToken)
        : null
    } catch (error) {
      throw new DatabaseError('Failed to find refresh token', error)
    }
  }

  async findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken[]> {
    const client = tx || this.prisma
    try {
      const refreshTokens = await client.refreshToken.findMany({
        where: { userId },
      })
      return refreshTokens.map(this.mapPrismaToRefreshToken)
    } catch (error) {
      throw new DatabaseError('Failed to find user refresh tokens', error)
    }
  }

  async revokeToken(
    token: string,
    replacedByToken?: string,
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken> {
    const client = tx || this.prisma
    try {
      const result = await client.refreshToken.update({
        where: { token },
        data: {
          revoked: true,
          replacedByToken,
        },
      })
      return this.mapPrismaToRefreshToken(result)
    } catch (error) {
      throw new DatabaseError('Failed to revoke refresh token', error)
    }
  }

  async revokeTokenFamily(
    family: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx || this.prisma
    try {
      await client.refreshToken.updateMany({
        where: { family },
        data: { revoked: true },
      })
    } catch (error) {
      throw new DatabaseError('Failed to revoke token family', error)
    }
  }

  async deleteExpired(tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx || this.prisma
    try {
      const result = await client.refreshToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
        },
      })
      return result.count
    } catch (error) {
      throw new DatabaseError('Failed to delete expired tokens', error)
    }
  }

  async findValidToken(
    token: string,
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken | null> {
    const client = tx || this.prisma
    try {
      const refreshToken = await client.refreshToken.findFirst({
        where: {
          token,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            include: {
              roles: true,
            },
          },
        },
      })
      return refreshToken
        ? (this.mapPrismaToRefreshToken(refreshToken) as RefreshToken)
        : null
    } catch (error) {
      throw new DatabaseError('Failed to find valid token', error)
    }
  }
}

export const refreshTokenRepository = new RefreshTokenRepository()