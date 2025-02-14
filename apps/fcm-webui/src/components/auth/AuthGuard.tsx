'use client'

import { useAuth } from '@/hooks/auth/useAuth'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { error, signIn } = useAuth()

  useEffect(() => {
    if (error?.error === 'RefreshAccessTokenError') {
      signIn()
    }
  }, [error, signIn])

  return <>{children}</>
}
