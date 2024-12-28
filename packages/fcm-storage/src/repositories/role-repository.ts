import { PrismaClient } from '@prisma/client'
import { CreateRole, UpdateRole, Role } from '../schema/role.js'

export class RoleRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    })
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        permissions: true,
      },
    })
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    })
  }

  async create(data: CreateRole): Promise<Role> {
    return this.prisma.role.create({
      data,
      include: {
        permissions: true,
      },
    })
  }

  async update(id: string, data: UpdateRole): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
      include: {
        permissions: true,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    })
  }
}