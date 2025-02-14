import { useCallback, useEffect, useState } from 'react'
import { authClient } from './auth-client'
import { AuthMeResponse, AuthSession, TokenError, AuthErrorCode } from '@fcm/shared/auth'
import { useRouter } from 'next/navigation'
import { ConsoleLogger } from '@fcm/shared/logging'

// Initialize logger for auth-related activities
const logger = new ConsoleLogger('auth')

interface AuthState {
  user: AuthMeResponse | null
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false
  })

  const router = useRouter()

  // Fetch current user data with automatic retry on token expiration
  const fetchUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const user = await authClient.getCurrentUser()
      
      setState({ 
        user, 
        isLoading: false, 
        error: null,
        isAuthenticated: !!user 
      })
      
      return user
    } catch (error) {
      logger.error('Failed to fetch user data', { error })
      
      // Handle specific auth errors
      if (error instanceof TokenError) {
        switch (error.code) {
          case AuthErrorCode.TOKEN_EXPIRED:
            // Token expired during the request, attempt refresh
            try {
              await authClient.refreshAccessToken()
              // Retry fetch after refresh
              return fetchUser()
            } catch (refreshError) {
              setState({
                user: null,
                isLoading: false,
                error: new Error('Session expired'),
                isAuthenticated: false
              })
              router.push('/auth/login')
            }
            break
          
          case AuthErrorCode.TOKEN_INVALID:
          case AuthErrorCode.TOKEN_MISSING:
            setState({
              user: null,
              isLoading: false,
              error: new Error('Authentication required'),
              isAuthenticated: false
            })
            router.push('/auth/login')
            break
        }
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch user'),
        isAuthenticated: false
      }))
      
      throw error
    }
  }, [router])

  // Handle login with comprehensive error handling
  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const session = await authClient.login(email, password)
      logger.debug('Login successful', { email })
      
      // After successful login, fetch user data
      const user = await fetchUser()
      
      // Update state with authenticated user
      setState({
        user,
        isLoading: false,
        error: null,
        isAuthenticated: true
      })
      
      return session
    } catch (error) {
      logger.error('Login failed', { error, email })
      
      let errorMessage = 'Login failed'
      if (error instanceof TokenError) {
        switch (error.code) {
          case AuthErrorCode.INVALID_CREDENTIALS:
            errorMessage = 'Invalid email or password'
            break
          case AuthErrorCode.USER_NOT_FOUND:
            errorMessage = 'User not found'
            break
          // Add other specific error cases as needed
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: new Error(errorMessage),
        isAuthenticated: false
      }))
      
      throw error
    }
  }, [fetchUser])

  // Handle logout with cleanup
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      await authClient.logout()
      
      // Clear auth state
      setState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
      })
      
      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      logger.error('Logout failed', { error })
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Logout failed')
      }))
    }
  }, [router])

  // Setup automatic user data refresh and token management
  useEffect(() => {
    // Fetch initial user data
    fetchUser()

    // Subscribe to token updates
    const unsubscribe = authClient.onTokenUpdate(async () => {
      // Refresh user data when token changes
      await fetchUser()
    })

    // Set up visibility change handler for token refresh
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated) {
        fetchUser()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup subscriptions
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUser, state.isAuthenticated])

  return {
    ...state,
    login,
    logout,
    refreshUser: fetchUser,
  }
}

// Export auth-related types for convenience
export type { AuthState }
