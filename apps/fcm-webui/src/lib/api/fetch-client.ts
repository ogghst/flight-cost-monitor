import { auth } from '@/lib/auth'
import { middlewareLogger as logger } from '../middleware-logger'

const API_URL = process.env.API_URL

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: HeadersInit
  cache?: RequestCache
  tags?: string[]
  revalidate?: number | false
}

// Track refresh token state
let isRefreshing = false
let refreshPromise: Promise<any> | null = null
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

function processFailedQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

async function addToFailedQueue(): Promise<string> {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  })
}

// Enhanced cookie check
function hasRefreshTokenCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('fcm_refresh_token=')
}

async function getAuthHeader() {
  const session = await auth()
  logger.log('Auth session state', {
    hasSession: !!session,
    hasAccessToken: !!session?.accessToken,
  })
  return session?.accessToken ? `Bearer ${session.accessToken}` : ''
}

async function refreshAccessToken() {
  // If already refreshing, return the existing promise
  if (refreshPromise) {
    logger.log('Using existing refresh request')
    return refreshPromise
  }

  // Check for refresh token cookie
  if (!hasRefreshTokenCookie()) {
    logger.error('No refresh token cookie found')
    throw new ApiError('No refresh token available', 401)
  }

  logger.log('Starting new token refresh')

  try {
    isRefreshing = true
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text()
        logger.error('Token refresh failed', {
          status: response.status,
          error: errorText,
        })

        // Clean up failed queue on error
        const error = new ApiError('Session expired', 401)
        processFailedQueue(error)
        throw error
      }

      const data = await response.json()
      logger.log('Token refresh successful', {
        hasNewAccessToken: !!data.accessToken,
      })

      // Process queue with new token
      processFailedQueue(null, data.accessToken)
      return data
    })

    return await refreshPromise
  } catch (error) {
    logger.error('Token refresh error', { error })
    processFailedQueue(error as Error)
    throw error
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache,
    tags,
    revalidate,
  } = options

  const authHeader = await getAuthHeader()

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authHeader && { Authorization: authHeader }),
    ...headers,
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
    cache,
    next: {
      tags,
      ...(typeof revalidate !== 'undefined' && {
        revalidate,
      }),
    },
  }

  if (body) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  logger.log('Making API request', {
    endpoint,
    method,
    hasAuthHeader: !!authHeader,
  })

  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestInit)

    // Handle 401 Unauthorized responses with token refresh
    if (response.status === 401) {
      logger.log('Received 401, handling token refresh')

      try {
        let refreshData

        if (isRefreshing) {
          // Wait for the existing refresh request
          logger.log('Waiting for existing refresh request')
          const newToken = await addToFailedQueue()
          logger.log('Received new token from queue')
          refreshData = { accessToken: newToken }
        } else {
          // Start new refresh
          refreshData = await refreshAccessToken()
        }

        // Retry the original request with new token
        logger.log('Retrying original request with new token')
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...requestInit,
          headers: {
            ...requestHeaders,
            Authorization: `Bearer ${refreshData.accessToken}`,
          },
        })

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => null)
          logger.error('Request failed after token refresh', {
            status: retryResponse.status,
            error: errorData,
          })
          throw new ApiError(
            'Request failed after token refresh',
            retryResponse.status,
            errorData
          )
        }

        return retryResponse.json()
      } catch (refreshError) {
        logger.error('Authentication failed after refresh attempt', {
          error: refreshError,
        })
        throw new ApiError('Authentication expired', 401)
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      logger.error('API request failed', {
        status: response.status,
        error: errorData,
      })
      throw new ApiError('Request failed', response.status, errorData)
    }

    logger.log('API request successful', {
      endpoint,
      status: response.status,
    })
    return response.json()
  } catch (error) {
    logger.error('API request error', { error })
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      'Network error',
      0,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

// Helper methods for common HTTP operations
export const api = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(
    endpoint: string,
    body: any,
    options?: Omit<RequestOptions, 'method'>
  ) => fetchApi<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(
    endpoint: string,
    body: any,
    options?: Omit<RequestOptions, 'method'>
  ) => fetchApi<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(
    endpoint: string,
    body: any,
    options?: Omit<RequestOptions, 'method'>
  ) => fetchApi<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
}
