import type {
  CreateTaskExecutionDto,
  ExecutionState,
  TaskExecutionDto,
  UpdateTaskExecutionDto,
} from '@fcm/shared/scheduler'
import type { TaskExecution as TaskExecutioPrisma } from '@prisma/client'
import { Prisma } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { DatabaseError } from '../schema/types.js'
import { fcmPrismaClient, type ExtendedTransactionClient } from './prisma.js'

export class TaskExecutionRepository {
  private prisma = fcmPrismaClient

  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<TaskExecutionDto | null> {
    const client = tx || this.prisma
    try {
      const tep = await client.taskExecution.findUnique({
        where: { id },
      })
      return tep ? await this.toDto(tep) : null
    } catch (error) {
      throw new DatabaseError('Failed to find task execution', error)
    }
  }

  async findByTask(
    taskId: string,
    limit: number = 10,
    tx?: Prisma.TransactionClient
  ): Promise<TaskExecutionDto[]> {
    const client = tx || this.prisma
    try {
      const tep = await client.taskExecution.findMany({
        where: { taskId },
        orderBy: { startTime: 'desc' },
        take: limit,
      })
      return await this.toDtoArray(tep)
    } catch (error) {
      throw new DatabaseError('Failed to find task executions', error)
    }
  }

  async create(
    data: CreateTaskExecutionDto,
    tx?: Prisma.TransactionClient
  ): Promise<TaskExecutionDto> {
    const client = tx || this.prisma
    try {
      const tep = await client.taskExecution.create({
        data,
      })
      return await this.toDto(tep)
    } catch (error) {
      throw new DatabaseError('Failed to create task execution', error)
    }
  }

  async update(
    data: UpdateTaskExecutionDto,
    tx?: Prisma.TransactionClient
  ): Promise<TaskExecutionDto> {
    const client = tx || this.prisma
    try {
      const tep = await client.taskExecution.update({
        where: { id: data.id },
        data,
      })
      return await this.toDto(tep)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new DatabaseError(
            'Task execution not found',
            error,
            'NOT_FOUND'
          )
        }
      }
      throw new DatabaseError('Failed to update task execution', error)
    }
  }

  async deleteOlderThan(
    date: Date,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || this.prisma
    try {
      const result = await client.taskExecution.deleteMany({
        where: {
          startTime: {
            lt: date,
          },
        },
      })
      return result.count
    } catch (error) {
      throw new DatabaseError('Failed to delete old task executions', error)
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

  async toDto(tep: TaskExecutioPrisma): Promise<TaskExecutionDto> {
    return {
      ...tep,
      state: tep.state as ExecutionState,
      error: tep.error ? JSON.parse(tep.error) : undefined,
      endTime: tep.endTime !== null ? tep.endTime : undefined,
      duration: tep.duration !== null ? tep.duration : undefined,
      result: tep.result ? JSON.parse(tep.result) : undefined,
    }
  }

  async toDtoArray(teps: TaskExecutioPrisma[]): Promise<TaskExecutionDto[]> {
    const dtos = await Promise.all(teps.map((tep) => this.toDto(tep)))
    // Filter out null values and cast to TaskExecution[]
    return dtos.filter((dto): dto is TaskExecutionDto => dto !== null)
  }
}

export const taskExecutionRepository = new TaskExecutionRepository()
