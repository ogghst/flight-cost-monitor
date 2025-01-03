import { AuthType, OAuthProvider } from '@fcm/shared/auth'
import { Prisma, type User as PrismaUser } from '@prisma/client'
import { DatabaseError } from '../schema/types.js'
import type {
  CreateCredentialsUser,
  CreateOAuthUser,
} from '../schema/user/create.js'
import type { UserWithRelations } from '../schema/user/types.js'
import type { UpdateUser } from '../schema/user/update.js'
import { fcmPrismaClient } from './prisma.js'

export class UserRepository {
  private prisma = fcmPrismaClient

  private mapPrismaToUser(
    prismaUser: PrismaUser & { refreshTokens?: any[] }
  ): UserWithRelations {
    const { oauthProvider, ...rest } = prismaUser
    return {
      ...rest,
      authType:
        rest.authType == AuthType.CREDENTIAL
          ? AuthType.CREDENTIAL
          : AuthType.OAUTH,
      oauthProvider: oauthProvider
        ? oauthProvider === 'GITHUB'
          ? OAuthProvider.GITHUB
          : OAuthProvider.GOOGLE
        : null,
      password: rest.password || undefined,
      username: rest.username || undefined,
      oauthProfile: rest.oauthProfile ? String(rest.oauthProfile) : null,
      roles: [],
      refreshTokens: (prismaUser.refreshTokens || []).map((token) => ({
        ...token,
        generationNumber: 0,
      })),
      lastLogin: rest.lastLogin ? new Date(rest.lastLogin) : null,
      passwordResetExpires: rest.passwordResetExpires
        ? new Date(rest.passwordResetExpires)
        : null,
      createdAt: new Date(rest.createdAt),
      updatedAt: new Date(rest.updatedAt),
      deletedAt: rest.deletedAt ? new Date(rest.deletedAt) : null,
    }
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = tx || this.prisma
    try {
      const user = await client.user.findUnique({
        where: { id },
        include: {
          roles: true,
          refreshTokens: {
            where: {
              revoked: false,
              expiresAt: { gt: new Date() },
            },
          },
        },
      })
      return user ? this.mapPrismaToUser(user) : null
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID', error)
    }
  }

  async findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = tx || this.prisma
    try {
      const user = await client.user.findUnique({
        where: { email },
        include: {
          roles: true,
          refreshTokens: {
            where: {
              revoked: false,
              expiresAt: { gt: new Date() },
            },
          },
        },
      })
      return user ? this.mapPrismaToUser(user) : null
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', error)
    }
  }

  async findByOAuth(
    provider: string,
    providerId: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = tx || this.prisma
    try {
      const user = await client.user.findUnique({
        where: {
          oauthProvider_oauthProviderId: {
            oauthProvider: provider,
            oauthProviderId: providerId,
          },
        },
        include: {
          roles: true,
          refreshTokens: {
            where: {
              revoked: false,
              expiresAt: { gt: new Date() },
            },
          },
        },
      })
      return user ? this.mapPrismaToUser(user) : null
    } catch (error) {
      throw new DatabaseError('Failed to find user by OAuth', error)
    }
  }

  async findByUsername(
    username: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = tx || this.prisma
    try {
      const user = await client.user.findUnique({
        where: { username },
        include: {
          roles: true,
          refreshTokens: {
            where: {
              revoked: false,
              expiresAt: { gt: new Date() },
            },
          },
        },
      })
      return user ? this.mapPrismaToUser(user) : null
    } catch (error) {
      throw new DatabaseError('Failed to find user by username', error)
    }
  }

  async createCredentialsUser(
    data: CreateCredentialsUser,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.create({
        data: {
          ...data,
          authType: AuthType.CREDENTIAL,
          roles: {
            connect: [{ name: 'USER' }], // Connect default role
          },
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'User with this email/username already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to create user', error)
    }
  }

  async createOAuthUser(
    data: CreateOAuthUser,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.create({
        data: {
          ...data,
          authType: AuthType.OAUTH,
          roles: {
            connect: [{ name: 'USER' }],
          },
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'User with this OAuth provider ID already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to create OAuth user', error)
    }
  }

  async update(
    id: string,
    data: UpdateUser,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.update({
        where: { id },
        data,
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User not found', error, 'NOT_FOUND')
        }
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Email/username already in use',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to update user', error)
    }
  }

  async updateLastLogin(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.update({
        where: { id },
        data: {
          lastLogin: new Date(),
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      throw new DatabaseError('Failed to update last login', error)
    }
  }

  async setResetToken(
    id: string,
    token: string,
    expires: Date,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.update({
        where: { id },
        data: {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      throw new DatabaseError('Failed to set reset token', error)
    }
  }

  async clearResetToken(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.update({
        where: { id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      throw new DatabaseError('Failed to clear reset token', error)
    }
  }

  async findByResetToken(
    token: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations | null> {
    const client = tx || this.prisma
    try {
      const user = await client.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return user ? this.mapPrismaToUser(user) : null
    } catch (error) {
      throw new DatabaseError('Failed to find user by reset token', error)
    }
  }

  async addRoles(
    id: string,
    roleIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.update({
        where: { id },
        data: {
          roles: {
            connect: roleIds.map((roleId) => ({ id: roleId })),
          },
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      throw new DatabaseError('Failed to add roles to user', error)
    }
  }

  async removeRoles(
    id: string,
    roleIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<UserWithRelations> {
    const client = tx || this.prisma
    try {
      const user = await client.user.update({
        where: { id },
        data: {
          roles: {
            disconnect: roleIds.map((roleId) => ({ id: roleId })),
          },
        },
        include: {
          roles: true,
          refreshTokens: true,
        },
      })
      return this.mapPrismaToUser(user)
    } catch (error) {
      throw new DatabaseError('Failed to remove roles from user', error)
    }
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma
    try {
      await client.user.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to delete user', error)
    }
  }

  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(callback)
    } catch (error) {
      throw new DatabaseError('Transaction failed', error)
    }
  }
}

export const userRepository = new UserRepository()
