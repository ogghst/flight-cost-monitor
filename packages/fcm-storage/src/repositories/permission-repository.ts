import { Prisma } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import type {
  CreatePermission,
  Permission,
  UpdatePermission,
} from '../schema/permission.js'
import { DatabaseError } from '../schema/types.js'
import {
  fcmPrismaClient,
  type ExtendedPrismaClient,
  type ExtendedTransactionClient,
} from './prisma.js'

export class PermissionRepository {
  private prisma: ExtendedPrismaClient = fcmPrismaClient

  async findById(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.permission.findUnique({
        where: { id },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find permission by ID', error)
    }
  }

  async findByName(
    name: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.permission.findUnique({
        where: { name },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find permission by name', error)
    }
  }

  async findAll(tx?: Prisma.TransactionClient): Promise<Permission[] | null> {
    const client = tx || this.prisma
    try {
      return await client.permission.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      throw new DatabaseError('Failed to fetch permissions', error)
    }
  }

  async create(
    data: CreatePermission,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.permission.create({
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Permission with this name already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to create permission', error)
    }
  }

  async update(
    id: string,
    data: UpdatePermission,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.permission.update({
        where: { id },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Permission not found', error, 'NOT_FOUND')
        }
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Permission with this name already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to update permission', error)
    }
  }

  async delete(
    id: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.permission.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Permission not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to delete permission', error)
    }
  }

  async assignToRole(
    permissionId: string,
    roleId: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            connect: { id: permissionId },
          },
        },
        include: {
          permissions: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError(
            'Role or permission not found',
            error,
            'NOT_FOUND'
          )
        }
      }
      throw new DatabaseError('Failed to assign permission to role', error)
    }
  }

  async removeFromRole(
    permissionId: string,
    roleId: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            disconnect: { id: permissionId },
          },
        },
        include: {
          permissions: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError(
            'Role or permission not found',
            error,
            'NOT_FOUND'
          )
        }
      }
      throw new DatabaseError('Failed to remove permission from role', error)
    }
  }

  async getRolePermissions(
    roleId: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission[] | null> {
    const client = tx || this.prisma
    try {
      const role = await client.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: true,
        },
      })
      return role?.permissions || []
    } catch (error) {
      throw new DatabaseError('Failed to fetch role permissions', error)
    }
  }

  async assignMultipleToRole(
    permissionIds: string[],
    roleId: string,
    tx?: ExtendedTransactionClient
  ): Promise<Permission | null> {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            connect: permissionIds.map((id) => ({ id })),
          },
        },
        include: {
          permissions: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError(
            'Role or one of the permissions not found',
            error,
            'NOT_FOUND'
          )
        }
      }
      throw new DatabaseError(
        'Failed to assign multiple permissions to role',
        error
      )
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

  // Helper method to check if a permission exists
  async exists(id: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx || this.prisma
    try {
      const count = await client.permission.count({
        where: { id },
      })
      return count > 0
    } catch (error) {
      throw new DatabaseError('Failed to check permission existence', error)
    }
  }
}

export const permissionRepository = new PermissionRepository()
