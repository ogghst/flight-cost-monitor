'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' })
  }, [])

  const handleSignIn = useCallback(() => {
    signIn('github', { callbackUrl: '/' })
  }, [])

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    signIn: handleSignIn,
    signOut: handleSignOut,
    status,
  }
}
