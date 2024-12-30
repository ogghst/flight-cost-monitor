import { Prisma } from '@prisma/client'
import { DatabaseError } from '../schema/types'
import {
  CreateUserSearch,
  UpdateUserSearch,
  UserSearch,
} from '../schema/user-search'
import { fcmPrismaClient } from './prisma'

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
    searchType?: string,
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
        orderBy: {
          lastUsed: 'desc',
        },
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
        orderBy: {
          lastUsed: 'desc',
        },
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
        data,
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
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
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
          updatedAt: new Date(),
        },
      })
    } catch (error) {
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
        throw new Error('Search not found')
      }

      return await client.userSearch.update({
        where: { id },
        data: {
          favorite: !search.favorite,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to toggle favorite status', error)
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
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to soft delete user search', error)
    }
  }

  // Transaction helper
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
