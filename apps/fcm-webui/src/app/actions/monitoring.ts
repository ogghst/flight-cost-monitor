'use server'

import { api } from '@/lib/api/fetch-client'
import type { TaskMetrics, SystemMetrics } from '@fcm/shared/monitoring'

export async function getTaskMetricsAction(
  taskId: string
): Promise<TaskMetrics> {
  try {
    return await api.get<TaskMetrics>(
      `/monitoring/tasks/${taskId}/metrics`,
      {
        // Cache for 30 seconds with revalidation tag
        revalidate: 30,
        tags: [`task-metrics-${taskId}`],
      }
    )
  } catch (error) {
    console.error('Get task metrics error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get task metrics: ${error.message}`)
    }
    throw new Error('Failed to get task metrics')
  }
}

export async function getSystemMetricsAction(): Promise<SystemMetrics> {
  try {
    return await api.get<SystemMetrics>('/monitoring/system', {
      // Cache for 15 seconds with revalidation tag
      revalidate: 15,
      tags: ['system-metrics'],
    })
  } catch (error) {
    console.error('Get system metrics error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get system metrics: ${error.message}`)
    }
    throw new Error('Failed to get system metrics')
  }
}