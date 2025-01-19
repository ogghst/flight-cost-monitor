'use server'

import { api } from '@/lib/api/fetch-client'
import {
  CreateTaskScheduleDto,
  TaskExecutionDto,
  TaskScheduleDto,
  UpdateTaskScheduleDto,
} from '@fcm/shared/scheduler'

export async function createScheduledTaskAction(
  data: CreateTaskScheduleDto
): Promise<TaskScheduleDto> {
  try {
    return await api.post<TaskScheduleDto>('/tasks', data)
  } catch (error) {
    console.error('Create scheduled task error:', error)
    throw error instanceof Error
      ? error
      : new Error('Failed to create scheduled task')
  }
}

export async function getScheduledTasksAction(): Promise<TaskScheduleDto[]> {
  try {
    return await api.get<TaskScheduleDto[]>('/tasks', {
      // Cache for 30 seconds
      revalidate: 30,
      tags: ['scheduled-tasks'],
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to get tasks')
  }
}

export async function getScheduledTaskAction(
  id: string
): Promise<TaskScheduleDto> {
  try {
    return await api.get<TaskScheduleDto>(`/tasks/${id}`, {
      // Cache for 30 seconds
      revalidate: 30,
      tags: [`task-${id}`],
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to get task')
  }
}

export async function updateScheduledTaskAction(
  id: string,
  data: UpdateTaskScheduleDto
): Promise<TaskScheduleDto> {
  try {
    return await api.patch<TaskScheduleDto>(`/tasks/${id}`, data, {
      // Revalidate task caches
      tags: [`task-${id}`, 'scheduled-tasks'],
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to update task')
  }
}

export async function deleteScheduledTaskAction(id: string): Promise<void> {
  try {
    await api.delete(`/tasks/${id}`, {
      // Revalidate task caches
      tags: [`task-${id}`, 'scheduled-tasks'],
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete task')
  }
}

export async function pauseScheduledTaskAction(
  id: string
): Promise<TaskScheduleDto> {
  try {
    return await api.post<TaskScheduleDto>(`/tasks/${id}/pause`, null, {
      // Revalidate task caches
      tags: [`task-${id}`, 'scheduled-tasks'],
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to pause task')
  }
}

export async function resumeScheduledTaskAction(
  id: string
): Promise<TaskScheduleDto> {
  try {
    return await api.post<TaskScheduleDto>(`/tasks/${id}/resume`, null, {
      // Revalidate task caches
      tags: [`task-${id}`, 'scheduled-tasks'],
    })
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to resume task')
  }
}

export async function getTaskExecutionsAction(
  id: string,
  limit?: number
): Promise<TaskExecutionDto[]> {
  try {
    return await api.get<TaskExecutionDto[]>(
      `/tasks/${id}/executions${limit ? `?limit=${limit}` : ''}`,
      {
        // Cache for 30 seconds
        revalidate: 30,
        tags: [`task-executions-${id}`],
      }
    )
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get task executions')
  }
}

export async function getLastTaskExecutionAction(
  id: string
): Promise<TaskExecutionDto | null> {
  try {
    return await api.get<TaskExecutionDto | null>(
      `/tasks/${id}/last-execution`,
      {
        // Cache for 30 seconds
        revalidate: 30,
        tags: [`task-last-execution-${id}`],
      }
    )
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get last execution')
  }
}