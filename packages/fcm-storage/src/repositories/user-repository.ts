import { Prisma } from '@prisma/client'
import { DatabaseError } from '../schema/types.js'
import type { CreateUser, UpdateUser, User } from '../schema/user.js'
import { fcmPrismaClient } from './prisma.js'

export class UserRepository {
  private prisma = fcmPrismaClient

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const client = tx || this.prisma
    try {
      return await client.user.findUnique({
        where: { id },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID', error)
    }
  }

  async findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const client = tx || this.prisma
    try {
      return await client.user.findUnique({
        where: { email },
      })
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', error)
    }
  }

  async create(data: CreateUser, tx?: Prisma.TransactionClient): Promise<User> {
    const client = tx || this.prisma
    try {
      return await client.user.create({
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'User with this email already exists',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to create user', error)
    }
  }

  async update(
    id: string,
    data: UpdateUser,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    const client = tx || this.prisma
    try {
      return await client.user.update({
        where: { id },
        data,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User not found', error, 'NOT_FOUND')
        }
        if (error.code === 'P2002') {
          throw new DatabaseError(
            'Email already in use',
            error,
            'UNIQUE_CONSTRAINT'
          )
        }
      }
      throw new DatabaseError('Failed to update user', error)
    }
  }

  async hardDelete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prisma
    try {
      await client.user.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('User not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to delete user', error)
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

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          active: false,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to soft delete user', error)
    }
  }

  async restore(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma
    try {
      return await client.user.update({
        where: { id },
        data: {
          deletedAt: null,
          active: true,
        },
      })
    } catch (error) {
      throw new DatabaseError('Failed to restore user', error)
    }
  }
}

// Helper function that demonstrates using transactions for complex operations
async function createUserWithRole(
  userData: CreateUser,
  roleId: string
): Promise<User> {
  return userRepository.transaction(async (tx) => {
    const user = await userRepository.create(userData, tx)
    
    await tx.role.update({
      where: { id: roleId },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    })

    return user
  })
}

export const userRepository = new UserRepository()