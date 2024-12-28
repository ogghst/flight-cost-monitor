import { PrismaClient } from '@prisma/client'
import { CreateUser, UpdateUser, User } from '../schema/user.js'

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async create(data: CreateUser): Promise<User> {
    return this.prisma.user.create({
      data,
    })
  }

  async update(id: string, data: UpdateUser): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
  }
}
