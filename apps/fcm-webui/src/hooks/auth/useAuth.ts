'use client'

import { SessionData, TokenError } from '@fcm/shared/auth'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshSession = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await update()
    } finally {
      setIsRefreshing(false)
    }
  }, [update, isRefreshing])

  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/auth/signin' })
    }
  }, [session, router])

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' })
  }, [])

  const handleSignIn = useCallback(() => {
    signIn('github', { callbackUrl: '/' })
  }, [])

  return {
    user: session?.user,
    accessToken: session?.accessToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isRefreshing,
    refreshSession,
    signIn: handleSignIn,
    signOut: handleSignOut,
    status,
    error: session?.error as TokenError | undefined,
  }
}