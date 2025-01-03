import type { SearchType } from '@fcm/shared/auth'
import { Prisma } from '@prisma/client'
import { DatabaseError } from '../schema/types.js'
import type {
  CreateUserSearch,
  UpdateUserSearch,
  UserSearch,
} from '../schema/user-search.js'
import { fcmPrismaClient } from './prisma.js'

export class UserSearchRepository {
  private prisma = fcmPrismaClient

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch | null> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.findUnique({
        where: { id },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find user search by ID', error)
    }
  }

  async findByUser(
    userId: string,
    searchType?: SearchType,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch[]> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.findMany({
        where: {
          userId,
          ...(searchType && { searchType }),
          deletedAt: null,
        },
        orderBy: { lastUsed: 'desc' },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find user searches', error)
    }
  }

  async findFavorites(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch[]> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.findMany({
        where: {
          userId,
          favorite: true,
          deletedAt: null,
        },
        orderBy: { lastUsed: 'desc' },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find favorite searches', error)
    }
  }

  async create(
    data: CreateUserSearch,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.create({
        data: {
          ...data,
          lastUsed: data.lastUsed || new Date(),
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to create user search', error)
    }
  }

  async update(
    id: string,
    data: UpdateUserSearch,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.update({
        where: { id },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User search not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to update user search', error)
    }
  }

  async updateLastUsed(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.update({
        where: { id },
        data: {
          lastUsed: new Date(),
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User search not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to update last used timestamp', error)
    }
  }

  async toggleFavorite(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.findUnique({
        where: { id },
      })

      if (!search) {
        throw new DatabaseError('Search not found', null, 'NOT_FOUND')
      }

      return await client.userSearch.update({
        where: { id },
        data: {
          favorite: !search.favorite,
          lastUsed: new Date(),
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to toggle favorite status', error)
    }
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User search not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to delete user search', error)
    }
  }

  async softDelete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User search not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to soft delete user search', error)
    }
  }

  async restore(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearch> {
    const client = tx || this.prisma
    try {
      return await client.userSearch.update({
        where: { id },
        data: {
          deletedAt: null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User search not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to restore user search', error)
    }
  }

  async deleteOldSearches(
    userId: string,
    olderThan: Date,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.userSearch.deleteMany({
        where: {
          userId,
          favorite: false,
          lastUsed: {
            lt: olderThan,
          },
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to delete old searches', error)
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

export const userSearchRepository = new UserSearchRepository()
