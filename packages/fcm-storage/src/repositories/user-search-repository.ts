import type {
  CreateUserSearchDto,
  SearchType,
  UpdateUserSearchDto,
  UserSearchDto,
} from '@fcm/shared/user-search'
import { Prisma } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { DatabaseError } from '../schema/types.js'
import {
  fcmPrismaClient,
  type ExtendedPrismaClient,
  type ExtendedTransactionClient,
} from './prisma.js'

export class UserSearchRepository {
  private prisma: ExtendedPrismaClient = fcmPrismaClient

  async findById(
    id: string,
    tx?: ExtendedTransactionClient
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
            searchType: search.searchType as SearchType,
            userEmail: search.user.email,
          }
        : null
    } catch (error) {
      throw new DatabaseError('Failed to find user search by ID', error)
    }
  }

  async findByUserEmail(
    userEmail: string,
    searchType?: SearchType,
    tx?: ExtendedTransactionClient
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
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
      }))
    } catch (error) {
      throw new DatabaseError('Failed to find user searches', error)
    }
  }

  async findFavorites(
    userEmail: string,
    tx?: ExtendedTransactionClient
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
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
      }))
    } catch (error) {
      throw new DatabaseError('Failed to find favorite searches', error)
    }
  }

  async create(
    data: CreateUserSearchDto,
    tx?: ExtendedTransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      // Create search with user ID
      const search = await client.userSearch.create({
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
        ...search,
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
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
    tx?: ExtendedTransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.update({
        where: { id },
        data,
        include: {
          user: true,
        },
      })
      return {
        ...search,
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
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
    tx?: ExtendedTransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.update({
        where: { id },
        data: {
          lastUsed: new Date(),
        },
        include: {
          user: true,
        },
      })
      return {
        ...search,
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
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
    tx?: ExtendedTransactionClient
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
        ...search,
        searchType: updatedSearch.searchType as SearchType,
        userEmail: updatedSearch.user.email,
      }
    } catch (error) {
      throw new DatabaseError('Failed to toggle favorite status', error)
    }
  }

  async delete(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.delete({
        where: { id },
        include: {
          user: true,
        },
      })
      return {
        ...search,
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
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
    tx?: ExtendedTransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
        include: {
          user: true,
        },
      })
      return {
        ...search,
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
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
    tx?: ExtendedTransactionClient
  ): Promise<UserSearchDto> {
    const client = tx || this.prisma
    try {
      const search = await client.userSearch.update({
        where: { id },
        data: {
          deletedAt: null,
        },
        include: {
          user: true,
        },
      })
      return {
        ...search,
        searchType: search.searchType as SearchType,
        userEmail: search.user.email,
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
    tx?: ExtendedTransactionClient
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
    callback: (
      tx: Omit<ExtendedTransactionClient, ITXClientDenyList>
    ) => Promise<T>
  ): Promise<T> {
    try {
      return (await this.prisma.$transaction(callback)) as T
    } catch (error) {
      throw new DatabaseError('Transaction failed', error)
    }
  }
}

export const userSearchRepository = new UserSearchRepository()
