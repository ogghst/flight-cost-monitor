import {
  type CreateFlightOfferSearchDto,
  type FlightOfferSearchDto,
  type FlightOfferSearchParams,
  type UpdateFlightOfferSearchDto,
} from '@fcm/shared/flight-offer-search'
import { Prisma } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { DatabaseError } from '../schema/types.js'
import {
  fcmPrismaClient,
  type ExtendedPrismaClient,
  type ExtendedTransactionClient,
} from './prisma.js'

export class FlightOfferSearchRepository {
  private prisma: ExtendedPrismaClient = fcmPrismaClient

  async findById(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto | null> {
    const client = tx || this.prisma
    try {
      const search = await client.flightOfferSearch.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          results: {
            where: { deletedAt: null },
          },
          user: true,
        },
      })
      return search ? this.mapToDto(search) : null
    } catch (error) {
      throw new DatabaseError('Failed to find flight offer search by ID', error)
    }
  }

  async findByUserEmail(
    userEmail: string,
    params?: FlightOfferSearchParams,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto[]> {
    const client = tx || this.prisma
    try {
      const searches = await client.flightOfferSearch.findMany({
        where: {
          user: {
            email: userEmail,
          },
          deletedAt: null,
          ...(params?.searchType && { searchType: params.searchType }),
        },
        include: {
          results: {
            where: { deletedAt: null },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.page
          ? (params.page - 1) * (params?.limit || 10)
          : undefined,
        take: params?.limit || 10,
      })
      return searches.map(this.mapToDto)
    } catch (error) {
      throw new DatabaseError('Failed to find flight offer searches', error)
    }
  }

  async findByUserSearchId(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto[]> {
    const client = tx || this.prisma
    try {
      const searches = await client.flightOfferSearch.findMany({
        where: {
          savedSearchId: id,
          deletedAt: null,
        },
        include: {
          results: {
            where: { deletedAt: null },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      return searches.map(this.mapToDto)
    } catch (error) {
      throw new DatabaseError(
        'Failed to find flight offer searches by user search',
        error
      )
    }
  }

  async create(
    data: CreateFlightOfferSearchDto,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto> {
    const client = tx || this.prisma
    try {
      const created = await client.flightOfferSearch.create({
        data: {
          user: {
            connect: { email: data.userEmail },
          },
          // Only include userSearch connection if savedSearchId exists and is not empty
          ...(data.savedSearchId &&
            data.savedSearchId !== '' && {
              userSearch: {
                connect: { id: data.savedSearchId },
              },
            }),
          searchType: data.searchType,
          parameters: JSON.stringify(data.parameters),
          status: '',
          results: {
            create: data.results.map((result) => ({
              ...result,
              segments: JSON.stringify(result.segments),
            })),
          },
          totalResults: 0,
        },
        include: {
          results: true,
          user: true,
        },
      })
      return this.mapToDto(created)
    } catch (error) {
      throw new DatabaseError('Failed to create flight offer search', error)
    }
  }

  async update(
    id: string,
    data: UpdateFlightOfferSearchDto,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto> {
    const client = tx || this.prisma
    try {
      const updated = await client.flightOfferSearch.update({
        where: { id },
        data: {
          parameters: JSON.stringify(data.parameters),
          status: data.status,
          totalResults: data.totalResults,
          results: {
            update: data.results.map((result) => ({
              where: { id: result.id },
              data: {
                ...result,
                segments: JSON.stringify(result.segments),
              },
            })),
          },
        },
        include: {
          results: {
            where: { deletedAt: null },
          },
          user: true,
        },
      })
      return this.mapToDto(updated)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new DatabaseError(
          'Flight offer search not found',
          error,
          'NOT_FOUND'
        )
      }
      throw new DatabaseError('Failed to update flight offer search', error)
    }
  }

  async softDelete(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto> {
    const client = tx || this.prisma
    try {
      const deleted = await client.flightOfferSearch.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          results: {
            updateMany: {
              where: { deletedAt: null },
              data: { deletedAt: new Date() },
            },
          },
        },
        include: {
          results: true,
          user: true,
        },
      })
      return this.mapToDto(deleted)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new DatabaseError(
          'Flight offer search not found',
          error,
          'NOT_FOUND'
        )
      }
      throw new DatabaseError(
        'Failed to soft delete flight offer search',
        error
      )
    }
  }

  async restore(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<FlightOfferSearchDto> {
    const client = tx || this.prisma
    try {
      const restored = await client.flightOfferSearch.update({
        where: { id },
        data: {
          deletedAt: null,
          results: {
            updateMany: {
              where: { searchId: id },
              data: { deletedAt: null },
            },
          },
        },
        include: {
          results: true,
          user: true,
        },
      })
      return this.mapToDto(restored)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new DatabaseError(
          'Flight offer search not found',
          error,
          'NOT_FOUND'
        )
      }
      throw new DatabaseError('Failed to restore flight offer search', error)
    }
  }

  async deleteOldSearches(
    userEmail: string,
    olderThan: Date,
    tx?: ExtendedTransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.flightOfferSearch.updateMany({
        where: {
          user: {
            email: userEmail,
          },
          createdAt: {
            lt: olderThan,
          },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
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

  private mapToDto(entity: any): FlightOfferSearchDto {
    return {
      ...entity,
      userEmail: entity.user.email,
      parameters:
        typeof entity.parameters === 'string'
          ? JSON.parse(entity.parameters)
          : entity.parameters,
      results: entity.results?.map((result: any) => ({
        ...result,
        segments:
          typeof result.segments === 'string'
            ? JSON.parse(result.segments)
            : result.segments,
      })),
    }
  }
}

export const flightOfferSearchRepository = new FlightOfferSearchRepository()
