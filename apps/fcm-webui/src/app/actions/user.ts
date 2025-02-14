'use server'

import { api } from '@/lib/api/fetch-client'
import { auth } from '@/lib/auth'
import { AuthUser } from '@fcm/shared/auth'

export async function getCurrentUser(): Promise<AuthUser> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not present in session')
  }

  try {
    return await api.get<AuthUser>('/auth/me', {
      // Cache for 1 minute with revalidation tag
      //revalidate: 60,
      tags: ['user-profile'],
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user data: ${error.message}`)
    }
    throw new Error('Failed to fetch user data')
  }
}

interface UpdateProfileResponse {
  user: AuthUser
  message: string
}

export async function updateUserProfile(profileData: {
  firstName?: string
  lastName?: string
  username?: string
}) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  try {
    return await api.patch<UpdateProfileResponse>(
      '/users/profile',
      profileData,
      {
        // Revalidate user profile cache
        tags: ['user-profile'],
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }
    throw new Error('Failed to update profile')
  }
}

interface PasswordChangeResponse {
  message: string
  success: boolean
}

export async function changePassword(passwordData: {
  currentPassword: string
  newPassword: string
}) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  try {
    return await api.post<PasswordChangeResponse>(
      '/auth/password/change',
      passwordData
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to change password: ${error.message}`)
    }
    throw new Error('Failed to change password')
  }
}

interface PasswordResetRequestResponse {
  message: string
  success: boolean
}

export async function requestPasswordReset(email: string) {
  try {
    return await api.post<PasswordResetRequestResponse>(
      '/auth/password/reset-request',
      { email }
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to request password reset: ${error.message}`)
    }
    throw new Error('Failed to request password reset')
  }
}

interface PasswordResetResponse {
  message: string
  success: boolean
}

export async function resetPassword(resetData: {
  token: string
  password: string
}) {
  try {
    return await api.post<PasswordResetResponse>(
      '/auth/password/reset',
      resetData
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to reset password: ${error.message}`)
    }
    throw new Error('Failed to reset password')
  }
}
