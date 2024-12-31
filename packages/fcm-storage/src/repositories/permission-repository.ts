import { Prisma } from '@prisma/client'
import type { CreatePermission, UpdatePermission } from '../schema/permission.js'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient } from './prisma.js'

export class PermissionRepository {
  private prisma = fcmPrismaClient

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find permission by ID', error)
    }
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.permission.findFirst({
        where: {
          resource,
          action,
          deletedAt: null,
        },
      })
    } catch (error) {
      throw new DatabaseError(
        'Failed to find permission by resource and action',
        error
      )
    }
  }

  async findAll(tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.findMany({
        where: { deletedAt: null },
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      })
    } catch (error) {
      throw new DatabaseError('Failed to fetch permissions', error)
    }
  }

  async findByResource(resource: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.findMany({
        where: {
          resource,
          deletedAt: null,
        },
        orderBy: { action: 'asc' },
      })
    } catch (error) {
      throw new DatabaseError('Failed to fetch permissions by resource', error)
    }
  }

  async create(data: CreatePermission, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.create({
        data: {
          ...data,
          deletedAt: null,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Permission with this resource and action already exists',
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
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.permission.update({
        where: {
          id,
          deletedAt: null,
        },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Permission not found', error, 'NOT_FOUND')
        }
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Permission with this resource and action already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to update permission', error)
    }
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.update({
        where: {
          id,
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
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

  async restore(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.update({
        where: { id },
        data: { deletedAt: null },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Permission not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to restore permission', error)
    }
  }

  async findWithDeleted(tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.permission.findMany({
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      })
    } catch (error) {
      throw new DatabaseError(
        'Failed to fetch permissions including deleted',
        error
      )
    }
  }

  async assignToRole(
    permissionId: string,
    roleId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: {
          id: roleId,
          deletedAt: null,
        },
        data: {
          permissions: {
            connect: { id: permissionId },
          },
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
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma
    try {
      return await client.role.update({
        where: {
          id: roleId,
          deletedAt: null,
        },
        data: {
          permissions: {
            disconnect: { id: permissionId },
          },
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

  async getRolePermissions(roleId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      const role = await client.role.findFirst({
        where: {
          id: roleId,
          deletedAt: null,
        },
        include: {
          permissions: {
            where: { deletedAt: null },
          },
        },
      })
      return role?.permissions || []
    } catch (error) {
      throw new DatabaseError('Failed to fetch role permissions', error)
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

  async assignMultipleToRole(permissionIds: string[], roleId: string) {
    return this.transaction(async (tx) => {
      const role = await tx.role.findFirst({
        where: {
          id: roleId,
          deletedAt: null,
        },
      })

      if (!role) {
        throw new DatabaseError('Role not found', null, 'NOT_FOUND')
      }

      return await tx.role.update({
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
    })
  }
}

export const permissionRepository = new PermissionRepository()