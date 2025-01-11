'use server'

import { makeServerRequest } from '@/lib/api/axiosConfig'
import type { 
  CreateTaskSchedule,
  TaskSchedule,
  UpdateTaskSchedule,
  TaskExecutionDto 
} from '@fcm/shared/scheduler/types'

export async function createScheduledTaskAction(
  data: CreateTaskSchedule
): Promise<TaskSchedule> {
  try {
    return await makeServerRequest<TaskSchedule>(
      'POST',
      '/tasks',
      JSON.stringify(data)
    )
  } catch (error) {
    console.error('Create scheduled task error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create scheduled task: ${error.message}`)
    }
    throw new Error('Failed to create scheduled task')
  }
}

export async function getScheduledTasksAction(): Promise<TaskSchedule[]> {
  try {
    return await makeServerRequest<TaskSchedule[]>('GET', '/tasks')
  } catch (error) {
    console.error('Get tasks error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get tasks: ${error.message}`)
    }
    throw new Error('Failed to get tasks')
  }
}

export async function getScheduledTaskAction(id: string): Promise<TaskSchedule> {
  try {
    return await makeServerRequest<TaskSchedule>('GET', `/tasks/${id}`)
  } catch (error) {
    console.error('Get task error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get task: ${error.message}`)
    }
    throw new Error('Failed to get task')
  }
}

export async function updateScheduledTaskAction(
  id: string,
  data: UpdateTaskSchedule
): Promise<TaskSchedule> {
  try {
    return await makeServerRequest<TaskSchedule>(
      'PATCH',
      `/tasks/${id}`,
      JSON.stringify(data)
    )
  } catch (error) {
    console.error('Update task error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to update task: ${error.message}`)
    }
    throw new Error('Failed to update task')
  }
}

export async function deleteScheduledTaskAction(id: string): Promise<void> {
  try {
    await makeServerRequest('DELETE', `/tasks/${id}`)
  } catch (error) {
    console.error('Delete task error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to delete task: ${error.message}`)
    }
    throw new Error('Failed to delete task')
  }
}

export async function pauseScheduledTaskAction(id: string): Promise<{status: string}> {
  try {
    return await makeServerRequest<{status: string}>(
      'POST',
      `/tasks/${id}/pause`
    )
  } catch (error) {
    console.error('Pause task error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to pause task: ${error.message}`)
    }
    throw new Error('Failed to pause task')
  }
}

export async function resumeScheduledTaskAction(id: string): Promise<{status: string}> {
  try {
    return await makeServerRequest<{status: string}>(
      'POST',
      `/tasks/${id}/resume`
    )
  } catch (error) {
    console.error('Resume task error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to resume task: ${error.message}`)
    }
    throw new Error('Failed to resume task')
  }
}

export async function getTaskExecutionsAction(
  id: string,
  limit?: number
): Promise<TaskExecutionDto[]> {
  try {
    const queryParams = limit ? `?limit=${limit}` : ''
    return await makeServerRequest<TaskExecutionDto[]>(
      'GET',
      `/tasks/${id}/executions${queryParams}`
    )
  } catch (error) {
    console.error('Get task executions error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get task executions: ${error.message}`)
    }
    throw new Error('Failed to get task executions')
  }
}

export async function getLastTaskExecutionAction(
  id: string
): Promise<TaskExecutionDto | null> {
  try {
    return await makeServerRequest<TaskExecutionDto>(
      'GET',
      `/tasks/${id}/last-execution`
    )
  } catch (error) {
    console.error('Get last execution error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get last execution: ${error.message}`)
    }
    throw new Error('Failed to get last execution')
  }
}