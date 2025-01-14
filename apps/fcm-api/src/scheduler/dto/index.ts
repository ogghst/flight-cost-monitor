import { createZodDto } from '@anatine/zod-nestjs'
import {
  createTaskExecutionSchema,
  createTaskScheduleSchema,
  createTaskStatsSchema,
  taskExecutionSchema,
  taskScheduleSchema,
  taskStatsSchema,
  updateTaskExecutionSchema,
  updateTaskScheduleSchema,
  updateTaskStatsSchema,
} from '@fcm/shared/scheduler'

export class TaskScheduleDtoSwagger extends createZodDto(taskScheduleSchema) {}

export class CreateTaskScheduleDtoSwagger extends createZodDto(
  createTaskScheduleSchema
) {}

export class UpdateTaskSchedulerDtoSwagger extends createZodDto(
  updateTaskScheduleSchema
) {}

export class TaskExecutionDtoSwagger extends createZodDto(
  taskExecutionSchema
) {}

export class CreateTaskExecutionDtoSwagger extends createZodDto(
  createTaskExecutionSchema
) {}

export class UpdateTaskExecutionDtoSwagger extends createZodDto(
  updateTaskExecutionSchema
) {}

export class TaskStatsDtoSwagger extends createZodDto(taskStatsSchema) {}

export class CreateTaskStatDtoSwagger extends createZodDto(
  createTaskStatsSchema
) {}

export class UpdateTaskStatDtoSwagger extends createZodDto(
  updateTaskStatsSchema
) {}
