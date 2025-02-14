import { cache } from 'react'
import { auth } from './auth'
import { SessionData } from '@fcm/shared/auth'

export const getSession = cache(async () => {
  const session = await auth()
  return session as SessionData | null
})