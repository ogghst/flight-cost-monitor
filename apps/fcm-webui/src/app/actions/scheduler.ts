'use server'

import { auth } from '@/lib/auth'
import {
  CreateTaskScheduleDto,
  TaskExecutionDto,
  TaskScheduleDto,
  UpdateTaskScheduleDto,
} from '@fcm/shared/scheduler'
import { headers } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:3001'

async function getAuthHeaders() {
  const session = await auth()
  const headersList = headers()

  return {
    'Content-Type': 'application/json',
    Authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    Cookie: (await headersList).get('cookie') || '',
  }
}

export async function createScheduledTaskAction(
  data: CreateTaskScheduleDto
): Promise<TaskScheduleDto> {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create scheduled task')
    }

    return response.json()
  } catch (error) {
    console.error('Create scheduled task error:', error)
    throw error instanceof Error
      ? error
      : new Error('Failed to create scheduled task')
  }
}

export async function getScheduledTasksAction(): Promise<TaskScheduleDto[]> {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: await getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get tasks')
    }

    return response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to get tasks')
  }
}

export async function getScheduledTaskAction(
  id: string
): Promise<TaskScheduleDto> {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      headers: await getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get task')
    }

    return response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to get task')
  }
}

export async function updateScheduledTaskAction(
  id: string,
  data: UpdateTaskScheduleDto
): Promise<TaskScheduleDto> {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update task')
    }

    return response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to update task')
  }
}

export async function deleteScheduledTaskAction(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete task')
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete task')
  }
}

export async function pauseScheduledTaskAction(
  id: string
): Promise<TaskScheduleDto> {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}/pause`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to pause task')
    }

    return response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to pause task')
  }
}

export async function resumeScheduledTaskAction(
  id: string
): Promise<TaskScheduleDto> {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}/resume`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to resume task')
    }

    return response.json()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to resume task')
  }
}

export async function getTaskExecutionsAction(
  id: string,
  limit?: number
): Promise<TaskExecutionDto[]> {
  try {
    const queryParams = limit ? `?limit=${limit}` : ''
    const response = await fetch(
      `${API_URL}/tasks/${id}/executions${queryParams}`,
      {
        headers: await getAuthHeaders(),
        credentials: 'include',
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get task executions')
    }

    return response.json()
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
    const response = await fetch(`${API_URL}/tasks/${id}/last-execution`, {
      headers: await getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get last execution')
    }

    return response.json()
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get last execution')
  }
}
