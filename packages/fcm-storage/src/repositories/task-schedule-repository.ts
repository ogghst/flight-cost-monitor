import type {
  CreateTaskScheduleDto,
  TaskScheduleDto,
  TaskState,
  UpdateTaskScheduleDto,
} from '@fcm/shared/scheduler/types'
import { Prisma, type TaskSchedule } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient, type ExtendedTransactionClient } from './prisma.js'

export class TaskScheduleRepository {
  private prisma = fcmPrismaClient

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskScheduleDto | null> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.findUnique({
        where: { id },
        include: {
          user: true,
          search: true,
        },
      })
      return db ? await this.toDto(db) : null
    } catch (error) {
      throw new DatabaseError('Failed to find task schedule', error)
    }
  }

  async findBySearchId(
    searchId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskScheduleDto | null> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.findFirst({
        where: {
          searchId,
          deletedAt: null,
        },
        include: {
          user: true,
          search: true,
        },
      })
      return db ? await this.toDto(db) : null
    } catch (error) {
      throw new DatabaseError(
        'Failed to find task schedule by search ID',
        error
      )
    }
  }

  async findActive(tx?: Prisma.TransactionClient): Promise<TaskScheduleDto[]> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.findMany({
        where: {
          state: 'ENABLED',
          deletedAt: null,
        },
        include: {
          user: true,
          search: true,
        },
      })
      return await this.toDtoArray(db)
    } catch (error) {
      throw new DatabaseError('Failed to find active task schedules', error)
    }
  }

  async findAll(tx?: Prisma.TransactionClient): Promise<TaskScheduleDto[]> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          search: true,
        },
      })
      return await this.toDtoArray(db)
    } catch (error) {
      throw new DatabaseError('Failed to find all task schedules', error)
    }
  }

  async create(
    data: CreateTaskScheduleDto,
    tx?: Prisma.TransactionClient
  ): Promise<TaskScheduleDto> {
    const client = tx || this.prisma
    try {
      // First, find user by email
      const user = await client.user.findUnique({
        where: { email: data.userEmail },
        select: { id: true },
      })

      if (!user) {
        throw new DatabaseError('User not found', null, 'NOT_FOUND')
      }

      const db = await client.taskSchedule.create({
        data: {
          ...data,
          state: data.state || 'ENABLED',
          userId: user.id,
        },
        include: {
          user: true,
          search: true,
        },
      })
      return await this.toDto(db)
    } catch (error) {
      throw new DatabaseError('Failed to create task schedule', error)
    }
  }

  async update(
    data: UpdateTaskScheduleDto,
    tx?: Prisma.TransactionClient
  ): Promise<TaskScheduleDto> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.update({
        where: { id: data.id },
        data,
        include: {
          user: true,
          search: true,
        },
      })
      return await this.toDto(db)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Task schedule not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to update task schedule', error)
    }
  }

  async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskScheduleDto> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.delete({
        where: { id },
        include: {
          user: true,
          search: true,
        },
      })
      return await this.toDto(db)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Task schedule not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to delete task schedule', error)
    }
  }

  async softDelete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskScheduleDto> {
    const client = tx || this.prisma
    try {
      const db = await client.taskSchedule.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          state: 'DISABLED',
        },
        include: {
          user: true,
          search: true,
        },
      })
      return await this.toDto(db)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Task schedule not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to soft delete task schedule', error)
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

  private async toDto(
    db: TaskSchedule & {
      user: { id: string; email: string }
      search: { id: string; name?: string | null }
    }
  ): Promise<TaskScheduleDto> {
    return {
      ...db,
      description: db.description || undefined,
      state: db.state as TaskState,
      userEmail: db.user.email,
      lastRunAt: db.lastRunAt || undefined,
      nextRunAt: db.nextRunAt || undefined,
    }
  }

  private async toDtoArray(
    schedules: (TaskSchedule & {
      user: { id: string; email: string }
      search: { id: string; name?: string | null }
    })[]
  ): Promise<TaskScheduleDto[]> {
    const dtos = await Promise.all(
      schedules.map((schedule) => this.toDto(schedule))
    )
    return dtos.filter((dto): dto is TaskScheduleDto => dto !== null)
  }
}

export const taskScheduleRepository = new TaskScheduleRepository()
