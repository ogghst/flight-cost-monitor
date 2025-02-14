import { 
  AuthErrorCode, 
  AuthErrorResponse, 
  AuthMeResponse, 
  AuthSession,
  TokenError,
  validateTokenFormat,
  shouldRefreshToken,
  AUTH_CONSTANTS 
} from '@fcm/shared/auth'
import { fetchApi } from '../api/fetch-client'

// We use a class to manage authentication state and operations
class AuthClient {
  private refreshPromise: Promise<string> | null = null
  private tokenUpdateCallbacks: ((token: string) => void)[] = []

  constructor(private readonly baseUrl: string = process.env.API_URL || '') {
    // Initialize error handling and token refresh mechanism
    this.setupTokenRefreshScheduling()
  }

  // Handles user login with email and password
  async login(email: string, password: string): Promise<AuthSession> {
    try {
      const response = await fetchApi<AuthSession>('/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include' // Important for cookies
      })

      // Validate the received token before proceeding
      if (!validateTokenFormat(response.accessToken).isValid) {
        throw new TokenError(
          'Received invalid access token',
          AuthErrorCode.TOKEN_INVALID
        )
      }

      // Schedule token refresh if needed
      this.scheduleTokenRefresh(response.accessToken)

      return response
    } catch (error) {
      // Convert errors to our standard format
      this.handleAuthError(error)
    }
  }

  // Fetches the current user's profile
  async getCurrentUser(): Promise<AuthMeResponse | null> {
    try {
      const response = await fetchApi<AuthMeResponse>('/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      return response
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        // Attempt token refresh on unauthorized
        try {
          await this.refreshAccessToken()
          // Retry the request after refresh
          return await this.getCurrentUser()
        } catch (refreshError) {
          // If refresh fails, user needs to login again
          return null
        }
      }
      this.handleAuthError(error)
    }
  }

  // Handles token refresh
  async refreshAccessToken(): Promise<string> {
    // If a refresh is already in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    try {
      this.refreshPromise = (async () => {
        const response = await fetchApi<{ accessToken: string }>('/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })

        const { accessToken } = response

        // Validate new token
        if (!validateTokenFormat(accessToken).isValid) {
          throw new TokenError(
            'Received invalid refresh token',
            AuthErrorCode.TOKEN_INVALID
          )
        }

        // Notify all listeners about the token update
        this.tokenUpdateCallbacks.forEach(callback => callback(accessToken))

        // Schedule next refresh
        this.scheduleTokenRefresh(accessToken)

        return accessToken
      })()

      return await this.refreshPromise
    } catch (error) {
      this.handleAuthError(error)
    } finally {
      this.refreshPromise = null
    }
  }

  // Handles user logout
  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      // Clear any scheduled refreshes
      this.clearTokenRefreshSchedule()
    } catch (error) {
      this.handleAuthError(error)
    }
  }

  // Registers a callback for token updates
  onTokenUpdate(callback: (token: string) => void): () => void {
    this.tokenUpdateCallbacks.push(callback)
    return () => {
      this.tokenUpdateCallbacks = this.tokenUpdateCallbacks.filter(cb => cb !== callback)
    }
  }

  private setupTokenRefreshScheduling() {
    // Setup token refresh on visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkAndRefreshToken()
        }
      })
    }
  }

  private async checkAndRefreshToken(): Promise<void> {
    const session = await this.getCurrentSession()
    if (session?.accessToken && shouldRefreshToken(session.accessToken)) {
      try {
        await this.refreshAccessToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }
  }

  private scheduleTokenRefresh(token: string) {
    if (!token) return

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = decoded.exp * 1000
      const refreshAt = expiresAt - AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_THRESHOLD

      const delay = refreshAt - Date.now()
      if (delay > 0) {
        setTimeout(() => this.refreshAccessToken(), delay)
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error)
    }
  }

  private clearTokenRefreshSchedule() {
    this.tokenUpdateCallbacks = []
  }

  private isUnauthorizedError(error: unknown): boolean {
    return (
      error instanceof TokenError && 
      error.code === AuthErrorCode.TOKEN_EXPIRED
    )
  }

  private handleAuthError(error: unknown): never {
    if (error instanceof TokenError) {
      throw error
    }

    // Convert unknown errors to TokenError
    throw new TokenError(
      'Authentication failed',
      AuthErrorCode.TOKEN_INVALID,
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    )
  }

  private async getCurrentSession(): Promise<AuthSession | null> {
    // This should be implemented based on your session management
    // For Next.js, you might use the auth() function
    return null
  }
}

// Create and export a singleton instance
export const authClient = new AuthClient()
