'use server'

import { fetchFCMServer } from '@/lib/api/fetch'
import type { SystemMetrics, TaskMetrics } from '@fcm/shared/monitoring'

export async function getTaskMetricsAction(
  taskId: string
): Promise<TaskMetrics> {
  try {
    return await fetchFCMServer<TaskMetrics>(
      'GET',
      `/monitoring/tasks/${taskId}/metrics`
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
    return await fetchFCMServer<SystemMetrics>('GET', '/monitoring/system')
  } catch (error) {
    console.error('Get system metrics error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get system metrics: ${error.message}`)
    }
    throw new Error('Failed to get system metrics')
  }
}
