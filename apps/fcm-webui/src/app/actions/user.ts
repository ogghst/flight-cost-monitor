// src/app/actions/user.ts
'use server'

import { auth } from '@/lib/auth'
import { userRepository } from '@fcm/storage/repositories'
import { DatabaseError, User } from '@fcm/storage/schema'

export async function getCurrentUser(): Promise<User> {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not present in session')
    }

    const user = await userRepository.findByEmail(session.user.email)
    if (user == null) throw new Error('User not found')
    return user
  } catch (error) {
    if (error instanceof DatabaseError) {
      // Handle specific database errors
      console.error('Database error:', error.message)
      throw new Error('Failed to fetch user data')
    }
    throw error
  }
}
