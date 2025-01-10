import { z } from 'zod'

export enum TaskState {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export enum ExecutionState {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  SKIPPED = 'SKIPPED',
}

// Task Schedule DTOs
export interface TaskScheduleDto {
  userEmail: string
  id: string
  name: string
  description?: string
  searchId: string
  state: TaskState
  cronExpression: string
  timeout: number
  maxRetries: number
  lastRunAt?: Date
  nextRunAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateTaskScheduleDto {
  userEmail: string
  name: string
  description?: string
  searchId: string
  cronExpression: string
  timeout: number
  maxRetries: number
  state?: TaskState
}

export interface UpdateTaskScheduleDto {
  name?: string
  description?: string
  cronExpression?: string
  timeout?: number
  maxRetries?: number
  state?: TaskState
}

// Task Execution DTOs
export interface TaskExecutionDto {
  id: string
  taskId: string
  state: ExecutionState
  startTime: Date
  endTime?: Date
  duration?: number
  attempt: number
  error?: string
  result?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTaskExecutionDto {
  taskId: string
  state: ExecutionState
  startTime: Date
  attempt: number
  result?: string
}

export interface UpdateTaskExecutionDto {
  id: string
  state?: ExecutionState
  endTime?: Date
  duration?: number
  attempt?: number
  error?: string
  result?: string
}

// Task Stats DTOs
export interface TaskStatsDto {
  id: string
  taskId: string
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  averageDuration: number
  lastExecutionState: ExecutionState
  lastError?: string
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateTaskStatsDto {
  taskId: string
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  averageDuration: number
  lastExecutionState: ExecutionState
  periodStart: Date
  periodEnd: Date
}

export interface UpdateTaskStatsDto {
  id: string
  totalRuns?: number
  successfulRuns?: number
  failedRuns?: number
  averageDuration?: number
  lastExecutionState?: ExecutionState
  lastError?: string
  periodStart: Date
  periodEnd: Date
}

// Validation Schemas
export const taskScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  searchId: z.string(),
  state: z.nativeEnum(TaskState),
  cronExpression: z.string(),
  timeout: z.number().int().positive(),
  maxRetries: z.number().int().min(0),
  lastRunAt: z.date().optional(),
  nextRunAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createTaskScheduleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  searchId: z.string(),
  cronExpression: z.string(),
  timeout: z.number().int().positive(),
  maxRetries: z.number().int().min(0),
  state: z.nativeEnum(TaskState).optional().default(TaskState.ENABLED),
})

export const updateTaskScheduleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  cronExpression: z.string().optional(),
  timeout: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).optional(),
  state: z.nativeEnum(TaskState).optional(),
})

export const taskExecutionSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  state: z.nativeEnum(ExecutionState),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  attempt: z.number().int().min(1),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
      stack: z.string().optional(),
    })
    .optional(),
  result: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createTaskExecutionSchema = z.object({
  taskId: z.string(),
  state: z.nativeEnum(ExecutionState),
  startTime: z.date(),
  attempt: z.number().int().min(1),
  result: z.string().optional(),
})

export const updateTaskExecutionSchema = z.object({
  state: z.nativeEnum(ExecutionState).optional(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  attempt: z.number().int().min(1).optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
      stack: z.string().optional(),
    })
    .optional(),
  result: z.string().optional(),
})

export const taskStatsSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  averageDuration: z.number(),
  lastExecutionState: z.nativeEnum(ExecutionState),
  lastError: z.string().optional(),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createTaskStatsSchema = z.object({
  taskId: z.string(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  averageDuration: z.number(),
  lastExecutionState: z.nativeEnum(ExecutionState),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
})

export const updateTaskStatsSchema = z.object({
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  averageDuration: z.number().optional(),
  lastExecutionState: z.nativeEnum(ExecutionState).optional(),
  lastError: z.string().optional(),
  period: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
})

// Type aliases using zod inference
export type TaskSchedule = z.infer<typeof taskScheduleSchema>
export type CreateTaskSchedule = z.infer<typeof createTaskScheduleSchema>
export type UpdateTaskSchedule = z.infer<typeof updateTaskScheduleSchema>
export type TaskExecution = z.infer<typeof taskExecutionSchema>
export type CreateTaskExecution = z.infer<typeof createTaskExecutionSchema>
export type UpdateTaskExecution = z.infer<typeof updateTaskExecutionSchema>
export type TaskStats = z.infer<typeof taskStatsSchema>
export type CreateTaskStats = z.infer<typeof createTaskStatsSchema>
export type UpdateTaskStats = z.infer<typeof updateTaskStatsSchema>
