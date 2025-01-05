'use server'

import axiosInstance from '@/lib/api/axiosConfig'
import { auth } from '@/lib/auth'
import { AuthUser } from '@fcm/shared/auth'
import { AxiosError } from 'axios'

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not present in session')
    }

    const { data } = await axiosInstance.get('/auth/me')
    if (!data) {
      throw new Error('User not found')
    }
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch user data'
      )
    }
    throw error
  }
}

export async function updateUserProfile(profileData: {
  firstName?: string
  lastName?: string
  username?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.patch('/users/profile', profileData)
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update profile'
      )
    }
    throw error
  }
}

export async function changePassword(passwordData: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.post(
      '/auth/password/change',
      passwordData
    )
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password'
      )
    }
    throw error
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const { data } = await axiosInstance.post('/auth/password/reset-request', {
      email,
    })
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to request password reset'
      )
    }
    throw error
  }
}

export async function resetPassword(resetData: {
  token: string
  password: string
}) {
  try {
    const { data } = await axiosInstance.post('/auth/password/reset', resetData)
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to reset password'
      )
    }
    throw error
  }
}
