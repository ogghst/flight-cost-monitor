import { z } from 'zod'

// Task Metrics Related Types
export const taskStatsSchema = z.object({
  totalRuns: z.number(),
  successfulRuns: z.number(),
  failedRuns: z.number(),
  averageDuration: z.number(),
  successRate: z.number()
})

export const recentExecutionSchema = z.object({
  id: z.string(),
  status: z.string(),
  startTime: z.string(),
  duration: z.number()
})

export const taskMetricsSchema = z.object({
  stats: taskStatsSchema,
  recentExecutions: z.array(recentExecutionSchema)
})

// System Metrics Related Types
export const systemMetricsSchema = z.object({
  totalExecutions: z.number(),
  totalSuccessful: z.number(),
  totalFailed: z.number(),
  successRate: z.number(),
  averageDuration: z.number(),
  taskCount: z.number()
})

// Type aliases using zod inference
export type TaskStats = z.infer<typeof taskStatsSchema>
export type RecentExecution = z.infer<typeof recentExecutionSchema>
export type TaskMetrics = z.infer<typeof taskMetricsSchema>
export type SystemMetrics = z.infer<typeof systemMetricsSchema>

// Export all schemas
export const monitoringSchemas = {
  taskStats: taskStatsSchema,
  recentExecution: recentExecutionSchema,
  taskMetrics: taskMetricsSchema,
  systemMetrics: systemMetricsSchema
} as const