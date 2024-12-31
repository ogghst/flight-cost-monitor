import { Prisma } from '@prisma/client'
import type { CreateRole, UpdateRole } from '../schema/role.js'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient } from './prisma.js'

export class RoleRepository {
  private prisma = fcmPrismaClient

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find role by ID', error)
    }
  }

  async findByName(name: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.findFirst({
        where: {
          name,
          deletedAt: null,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find role by name', error)
    }
  }

  async findAll(tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      throw new DatabaseError('Failed to fetch roles', error)
    }
  }

  async create(data: CreateRole, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.create({
        data: {
          ...data,
          deletedAt: null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Role with this name already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to create role', error)
    }
  }

  async update(id: string, data: UpdateRole, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role not found', error, 'NOT_FOUND')
        }
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Role name already in use',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to update role', error)
    }
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to delete role', error)
    }
  }

  async hardDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      await client.role.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to permanently delete role', error)
    }
  }

  async restore(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data: {
          deletedAt: null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to restore role', error)
    }
  }

  async findWithDeleted(tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      throw new DatabaseError('Failed to fetch roles including deleted', error)
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

  async assignUsersToRole(roleId: string, userIds: string[]) {
    return this.transaction(async (tx) => {
      const role = await this.findById(roleId, tx)
      if (!role) {
        throw new DatabaseError('Role not found', null, 'NOT_FOUND')
      }

      return await tx.role.update({
        where: { id: roleId },
        data: {
          users: {
            connect: userIds.map((id) => ({ id })),
          },
        },
      })
    })
  }
}

export const roleRepository = new RoleRepository()