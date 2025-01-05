import type { SearchType } from '@fcm/shared/auth'
import type {
  CreateUserSearchDto,
  UpdateUserSearchDto,
  UserSearchDto,
} from '@fcm/shared/user-search/types'
import { Prisma, type UserSearch } from '@prisma/client'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient } from './prisma.js'

export class UserSearchRepository {
  private prisma = fcmPrismaClient

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearchDto | null> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.findUnique({
        where: { id },
        include: {
          user: true,
        },
      })
      return search
        ? {
            ...search,
            userEmail: search.user.email,
            name: search.name ?? undefined,
          }
        : null
    } catch (error) {
      throw new DatabaseError('Failed to find user search by ID', error)
    }
  }

  async findByUserEmail(
    userEmail: string,
    searchType?: SearchType,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearchDto[]> {
    const client = tx || this.prisma
    try {
      const searches = await client.userSearch.findMany({
        where: {
          user: {
            email: userEmail,
          },
          ...(searchType && { searchType }),
          deletedAt: null,
        },
        orderBy: { lastUsed: 'desc' },
        include: {
          user: true,
        },
      })
      return searches.map((search) => ({
        ...search,
        userEmail: userEmail,
        name: search.name ?? undefined,
      }))
    } catch (error) {
      throw new DatabaseError('Failed to find user searches', error)
    }
  }

  async findFavorites(
    userEmail: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearchDto[]> {
    const client = tx || this.prisma
    try {
      const searches = await client.userSearch.findMany({
        where: {
          user: {
            email: userEmail,
          },
          favorite: true,
          deletedAt: null,
        },
        orderBy: { lastUsed: 'desc' },
        include: {
          user: true,
        },
      })
      return searches.map((search) => ({
        ...search,
        userEmail,
        name: search.name ?? undefined,
      }))
    } catch (error) {
      throw new DatabaseError('Failed to find favorite searches', error)
    }
  }

  async create(
    data: CreateUserSearchDto,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      // Create search with user ID
      const createdSearch = await client.userSearch.create({
        data: {
          searchType: data.searchType,
          parameters: data.parameters,
          name: data.name,
          favorite: data.favorite,
          lastUsed: new Date(),
          user: {
            connect: { email: data.userEmail },
          },
        },
        include: {
          user: true,
        },
      })

      return {
        ...createdSearch,
        userEmail: data.userEmail,
        name: createdSearch.name ?? undefined,
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      throw new DatabaseError('Failed to create user search', error)
    }
  }

  async update(
    id: string,
    data: UpdateUserSearchDto,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const updatedSearch = await client.userSearch.update({
        where: { id },
        data,
        include: {
          user: true,
        },
      })
      return {
        ...updatedSearch,
        userEmail: updatedSearch.user.email,
        name: updatedSearch.name ?? undefined,
      }
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
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const updatedSearch = await client.userSearch.update({
        where: { id },
        data: {
          lastUsed: new Date(),
        },
        include: {
          user: true,
        },
      })
      return {
        ...updatedSearch,
        userEmail: updatedSearch.user.email,
        name: updatedSearch.name ?? undefined,
      }
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
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.findUnique({
        where: { id },
      })

      if (!search) {
        throw new DatabaseError('Search not found', null, 'NOT_FOUND')
      }

      const updatedSearch = await client.userSearch.update({
        where: { id },
        data: {
          favorite: !search.favorite,
          lastUsed: new Date(),
        },
        include: {
          user: true,
        },
      })
      return {
        ...updatedSearch,
        userEmail: updatedSearch.user.email,
        name: updatedSearch.name ?? undefined,
      }
    } catch (error) {
      throw new DatabaseError('Failed to toggle favorite status', error)
    }
  }

  async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const deletedSearch = await client.userSearch.delete({
        where: { id },
        include: {
          user: true,
        },
      })
      return {
        ...deletedSearch,
        userEmail: deletedSearch.user.email,
        name: deletedSearch.name ?? undefined,
      }
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
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const deletedSearch = await client.userSearch.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        include: {
          user: true,
        },
      })
      return {
        ...deletedSearch,
        userEmail: deletedSearch.user.email,
        name: deletedSearch.name ?? undefined,
      }
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
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const restoredSearch = await client.userSearch.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        include: {
          user: true,
        },
      })
      return {
        ...restoredSearch,
        userEmail: restoredSearch.user.email,
        name: restoredSearch.name ?? undefined,
      }
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
    userEmail: string,
    olderThan: Date,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.userSearch.deleteMany({
        where: {
          user: {
            email: userEmail,
          },
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
