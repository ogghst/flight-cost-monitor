import { Prisma } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import type { CreateRole, UpdateRole } from '../schema/role.js'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient, type ExtendedPrismaClient, type ExtendedTransactionClient } from './prisma.js'

export class RoleRepository {
  private prisma: ExtendedPrismaClient = fcmPrismaClient

  async findById(id: string, tx?: ExtendedTransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.findUnique({
        where: { id },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find role by ID', error)
    }
  }

  async findByName(name: string, tx?: ExtendedTransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.findUnique({
        where: { name },
        include: {
          permissions: true,
          users: true,
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
        orderBy: { name: 'asc' },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to fetch roles', error)
    }
  }

  async create(data: CreateRole, tx?: ExtendedTransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.create({
        data,
        include: {
          permissions: true,
          users: true,
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

  async update(id: string, data: UpdateRole, tx?: ExtendedTransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data,
        include: {
          permissions: true,
          users: true,
        },
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

  async delete(id: string, tx?: Prisma.TransactionClient) {
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
      throw new DatabaseError('Failed to delete role', error)
    }
  }

  async updatePermissions(
    id: string,
    permissionIds: string[],
    tx?: ExtendedTransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data: {
          permissions: {
            set: permissionIds.map((permId) => ({ id: permId })),
          },
        },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError(
            'Role or permissions not found',
            error,
            'NOT_FOUND'
          )
        }
      }
      throw new DatabaseError('Failed to update role permissions', error)
    }
  }

  async addPermissions(
    id: string,
    permissionIds: string[],
    tx?: ExtendedTransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data: {
          permissions: {
            connect: permissionIds.map((permId) => ({ id: permId })),
          },
        },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError(
            'Role or permissions not found',
            error,
            'NOT_FOUND'
          )
        }
      }
      throw new DatabaseError('Failed to add role permissions', error)
    }
  }

  async removePermissions(
    id: string,
    permissionIds: string[],
    tx?: ExtendedTransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data: {
          permissions: {
            disconnect: permissionIds.map((permId) => ({ id: permId })),
          },
        },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to remove role permissions', error)
    }
  }

  async addUsers(
    id: string,
    userIds: string[],
    tx?: ExtendedTransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data: {
          users: {
            connect: userIds.map((userId) => ({ id: userId })),
          },
        },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role or users not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to add users to role', error)
    }
  }

  async removeUsers(
    id: string,
    userIds: string[],
    tx?: ExtendedTransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id },
        data: {
          users: {
            disconnect: userIds.map((userId) => ({ id: userId })),
          },
        },
        include: {
          permissions: true,
          users: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Role not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to remove users from role', error)
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

export const roleRepository = new RoleRepository()
