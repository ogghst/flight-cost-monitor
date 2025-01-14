import { z } from 'zod'
import { baseEntitySchema } from '../types/base-entity.js'

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

export enum TaskType {
  SIMPLE_SEARCH = 'SIMPLE_SEARCH',
  ADVANCED_SEARCH = 'ADVANCED_SEARCH',
}

/*
// Task Schedule DTOs
export interface TaskScheduleDto {
  userEmail: string
  id: string
  name: string
  description?: string
  taskType: TaskType
  payload: string
  state: TaskState
  cronExpression: string
  timeout: number
  maxRetries: number
  lastRunAt?: Date
  nextRunAt?: Date
  createdAt: Date
  updatedAt: Date
}
*/

// Validation Schemas
export const taskScheduleSchema = baseEntitySchema.extend({
  userEmail: z.string().describe('User Email'),
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  payload: z.string(),
  taskType: z.nativeEnum(TaskType),
  state: z.nativeEnum(TaskState),
  cronExpression: z.string(),
  timeout: z.number().int().min(0),
  maxRetries: z.number().int().min(0),
  lastRunAt: z.date().optional(),
  nextRunAt: z.date().optional(),
})

/*
export interface CreateTaskScheduleDto {
  userEmail: string
  name: string
  description?: string
  taskType: TaskType
  payload: string
  cronExpression: string
  timeout: number
  maxRetries: number
  state?: TaskState
}
*/

export const createTaskScheduleSchema = z.object({
  name: z.string(),
  userEmail: z.string().email('Email not valid'),
  description: z.string().optional(),
  payload: z.string(),
  taskType: z.nativeEnum(TaskType).default(TaskType.SIMPLE_SEARCH),
  cronExpression: z.string(),
  timeout: z.number().int().positive(),
  maxRetries: z.number().int().min(0),
  state: z.nativeEnum(TaskState).optional().default(TaskState.ENABLED),
})

/*
export interface UpdateTaskScheduleDto {
  id: string
  name?: string
  description?: string
  cronExpression?: string
  timeout?: number
  maxRetries?: number
  state?: TaskState
  nextRunAt?: Date
}
*/
export const updateTaskScheduleSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  cronExpression: z.string().optional(),
  timeout: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).optional(),
  state: z.nativeEnum(TaskState).optional(),
  nextRunAt: z.date().optional(),
})

/*
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
*/

export const taskExecutionSchema = baseEntitySchema.extend({
  id: z.string(),
  taskId: z.string(),
  state: z.nativeEnum(ExecutionState),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  attempt: z.number().int().min(1),
  error: z.string().optional(),
  result: z.string().optional(),
})

/*
export interface CreateTaskExecutionDto {
  taskId: string
  state: ExecutionState
  startTime: Date
  attempt: number
  result?: string
}
*/

export const createTaskExecutionSchema = z.object({
  taskId: z.string(),
  state: z.nativeEnum(ExecutionState),
  startTime: z.date(),
  attempt: z.number().int().min(1),
  result: z.string().optional(),
})

/*

export interface UpdateTaskExecutionDto {
  id: string
  state?: ExecutionState
  endTime?: Date
  duration?: number
  attempt?: number
  error?: string
  result?: string
}
  */

export const updateTaskExecutionSchema = z.object({
  id: z.string(),
  state: z.nativeEnum(ExecutionState).optional(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  attempt: z.number().int().min(1).optional(),
  error: z.string().optional(),
  result: z.string().optional(),
})

/*

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
  */

export const taskStatsSchema = baseEntitySchema.extend({
  id: z.string(),
  taskId: z.string(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  averageDuration: z.number(),
  lastExecutionState: z.nativeEnum(ExecutionState),
  lastError: z.string().optional(),
  periodStart: z.date(),
  periodEnd: z.date(),
})

/*
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
*/

export const createTaskStatsSchema = z.object({
  taskId: z.string(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  averageDuration: z.number(),
  lastExecutionState: z.nativeEnum(ExecutionState),
  periodStart: z.date(),
  periodEnd: z.date(),
})

/*
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

*/

export const updateTaskStatsSchema = z.object({
  id: z.string(),
  totalRuns: z.number().int().optional(),
  successfulRuns: z.number().int().optional(),
  failedRuns: z.number().int().optional(),
  averageDuration: z.number().optional(),
  lastExecutionState: z.nativeEnum(ExecutionState).optional(),
  lastError: z.string().optional(),
  periodStart: z.date().optional(),
  periodEnd: z.date().optional(),
})

// Type aliases using zod inference
export type TaskScheduleDto = z.infer<typeof taskScheduleSchema>
export type CreateTaskScheduleDto = z.infer<typeof createTaskScheduleSchema>
export type UpdateTaskScheduleDto = z.infer<typeof updateTaskScheduleSchema>
export type TaskExecutionDto = z.infer<typeof taskExecutionSchema>
export type CreateTaskExecutionDto = z.infer<typeof createTaskExecutionSchema>
export type UpdateTaskExecutionDto = z.infer<typeof updateTaskExecutionSchema>
export type TaskStatsDto = z.infer<typeof taskStatsSchema>
export type CreateTaskStatsDto = z.infer<typeof createTaskStatsSchema>
export type UpdateTaskStatsDto = z.infer<typeof updateTaskStatsSchema>
