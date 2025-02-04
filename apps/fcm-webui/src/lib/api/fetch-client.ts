import { auth } from '@/lib/auth'

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

async function getAuthHeader() {
  const session = await auth()
  console.log('Session in getAuthHeader:', session) // Keeping this for debugging
  return session?.accessToken ? `Bearer ${session.accessToken}` : ''
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
    Authorization: authHeader,
    ...headers,
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Essential for sending and receiving cookies
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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestInit)

    // Handle 401 Unauthorized responses with token refresh
    if (response.status === 401) {
      try {
        console.log('Attempting token refresh...')
        // Attempt to refresh the token
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Essential for cookies
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!refreshResponse.ok) {
          console.error('Token refresh failed:', await refreshResponse.text())
          throw new ApiError('Session expired', 401)
        }

        const refreshData = await refreshResponse.json()
        console.log('Token refresh successful')

        // Get new auth header with refreshed token
        const newAuthHeader = `Bearer ${refreshData.accessToken}`

        // Retry the original request with the new token
        console.log('Retrying original request with new token...')
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...requestInit,
          headers: {
            ...requestHeaders,
            Authorization: newAuthHeader,
          },
        })

        if (!retryResponse.ok) {
          throw new ApiError(
            'Request failed after token refresh',
            retryResponse.status,
            await retryResponse.json().catch(() => null)
          )
        }

        return retryResponse.json()
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError)
        // If refresh fails, user needs to login again
        throw new ApiError('Authentication expired', 401)
      }
    }

    if (!response.ok) {
      throw new ApiError(
        'Request failed',
        response.status,
        await response.json().catch(() => null)
      )
    }

    return response.json()
  } catch (error) {
    console.error('API request error:', error)
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