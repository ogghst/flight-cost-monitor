'use server'

import { makeServerRequest } from '@/lib/api/axiosConfig'
import { auth } from '@/lib/auth'
import { AuthUser } from '@fcm/shared/auth'

export async function getCurrentUser(): Promise<AuthUser> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not present in session')
  }

  try {
    return await makeServerRequest<AuthUser>('GET', '/auth/me')
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
    return await makeServerRequest<UpdateProfileResponse>(
      'PATCH',
      '/users/profile',
      JSON.stringify(profileData)
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
    return await makeServerRequest<PasswordChangeResponse>(
      'POST',
      '/auth/password/change',
      JSON.stringify(passwordData)
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
    return await makeServerRequest<PasswordResetRequestResponse>(
      'POST',
      '/auth/password/reset-request',
      JSON.stringify({ email })
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
    return await makeServerRequest<PasswordResetResponse>(
      'POST',
      '/auth/password/reset',
      JSON.stringify(resetData)
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to reset password: ${error.message}`)
    }
    throw new Error('Failed to reset password')
  }
}
