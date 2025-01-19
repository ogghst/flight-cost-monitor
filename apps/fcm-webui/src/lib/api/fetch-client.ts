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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestInit)

    // Handle 401 with token refresh
    if (response.status === 401) {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (!refreshResponse.ok) {
        throw new ApiError('Session expired', 401)
      }

      // Retry original request with new token
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...requestInit,
        headers: {
          ...requestHeaders,
          Authorization: await getAuthHeader(),
        },
      })

      if (!retryResponse.ok) {
        throw new ApiError(
          'Request failed',
          retryResponse.status,
          await retryResponse.json().catch(() => null)
        )
      }

      return retryResponse.json()
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

// Helper methods
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
