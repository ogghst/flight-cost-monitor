import type {
  CreateTaskStatsDto,
  ExecutionState,
  TaskStatsDto,
  UpdateTaskStatsDto,
} from '@fcm/shared/scheduler/types'
import { Prisma, type TaskStats } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient, type ExtendedTransactionClient } from './prisma.js'

export class TaskStatsRepository {
  private prisma = fcmPrismaClient

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskStatsDto | null> {
    const client = tx || this.prisma
    try {
      const db = await client.taskStats.findUnique({
        where: { id },
      })

      return db ? await this.toDto(db) : null
    } catch (error) {
      throw new DatabaseError('Failed to find task stats', error)
    }
  }

  async findLatest(
    taskId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskStatsDto | null> {
    const client = tx || this.prisma
    try {
      const db = await client.taskStats.findFirst({
        where: { taskId },
        orderBy: { periodEnd: 'desc' },
      })
      return db ? await this.toDto(db) : null
    } catch (error) {
      throw new DatabaseError('Failed to find latest task stats', error)
    }
  }

  async findAll(tx?: Prisma.TransactionClient): Promise<TaskStatsDto[]> {
    const client = tx || this.prisma
    try {
      const db = await client.taskStats.findMany({
        orderBy: { periodEnd: 'desc' },
      })
      return await this.toDtoArray(db)
    } catch (error) {
      throw new DatabaseError('Failed to find all task stats', error)
    }
  }

  async create(
    data: CreateTaskStatsDto,
    tx?: Prisma.TransactionClient
  ): Promise<TaskStatsDto> {
    const client = tx || this.prisma
    try {
      const db = await client.taskStats.create({
        data,
      })
      return await this.toDto(db)
    } catch (error) {
      throw new DatabaseError('Failed to create task stats', error)
    }
  }

  async update(
    data: UpdateTaskStatsDto,
    tx?: Prisma.TransactionClient
  ): Promise<TaskStatsDto> {
    const client = tx || this.prisma
    try {
      const db = await client.taskStats.update({
        where: { id: data.id },
        data,
      })
      return await this.toDto(db)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError('Task stats not found', error, 'NOT_FOUND')
        }
      }
      throw new DatabaseError('Failed to update task stats', error)
    }
  }

  async deleteOlderThan(
    date: Date,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || this.prisma
    try {
      const result = await client.taskStats.deleteMany({
        where: {
          periodEnd: {
            lt: date,
          },
        },
      })
      return result.count
    } catch (error) {
      throw new DatabaseError('Failed to delete old task stats', error)
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

  async toDto(db: TaskStats): Promise<TaskStatsDto> {
    return {
      ...db,
      lastExecutionState: db.lastExecutionState as ExecutionState,
      lastError: db.lastError || undefined,
    }
  }

  async toDtoArray(teps: TaskStats[]): Promise<TaskStatsDto[]> {
    const dtos = await Promise.all(teps.map((tep) => this.toDto(tep)))
    // Filter out null values and cast to TaskExecution[]
    return dtos.filter((dto): dto is TaskStatsDto => dto !== null)
  }
}

export const taskStatsRepository = new TaskStatsRepository()
