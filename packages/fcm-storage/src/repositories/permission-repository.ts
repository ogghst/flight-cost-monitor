import { PrismaClient } from '@prisma/client'
import {
  CreatePermission,
  Permission,
  UpdatePermission,
} from '../schema/permission.js'

export class PermissionRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { id },
    }) as Promise<Permission | null>
  }

  async findByRoleAndResource(
    roleId: string,
    resource: string
  ): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: {
        roleId,
        resource,
      },
    })
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { roleId },
    })
  }

  async checkPermission(
    roleId: string,
    typeId: string,
    resource: string
  ): Promise<boolean> {
    const [permission, adminPermission] = await Promise.all([
      this.prisma.permission.findFirst({
        where: {
          roleId,
          typeId,
          resource,
        },
      }),
      this.prisma.permission.findFirst({
        where: {
          roleId,
          typeId: 'ADMIN',
          resource: '*',
        },
      }),
    ])

    return Boolean(permission || adminPermission)
  }

  async create(data: CreatePermission): Promise<Permission> {
    return this.prisma.permission.create({
      data,
    })
  }

  async update(id: string, data: UpdatePermission): Promise<Permission> {
    return this.prisma.permission.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    })
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.prisma.permission.deleteMany({
      where: { roleId },
    })
  }
}
