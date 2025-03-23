'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:3001'
const API_TIMEOUT = Number(process.env.API_TIMEOUT) || 60000

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface FetchOptions {
  data?: any
  params?: Record<string, any>
  headers?: HeadersInit
}

async function fetchFCM<T>(
  method: HttpMethod,
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { data, params, headers: customHeaders } = options
  const session = await auth()
  const headersList = await headers()

  // Construct URL with query parameters
  const url = new URL(`${API_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    Cookie: headersList.get('cookie') || '',
    ...customHeaders,
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(url.toString(), {
      method,
      headers: requestHeaders,
      ...(data && { body: JSON.stringify(data) }),
      credentials: 'include',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      )
    }

    const result = await response.json()
    return result as T
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || 'An error occurred during the request')
    }
    throw new Error('An unexpected error occurred')
  }
}

/*
// Helper methods for common HTTP methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, 'data'>) =>
    fetchFCM<T>('GET', endpoint, options),

  post: <T>(endpoint: string, data: any, options?: FetchOptions) =>
    fetchFCM<T>('POST', endpoint, { ...options, data }),

  put: <T>(endpoint: string, data: any, options?: FetchOptions) =>
    fetchFCM<T>('PUT', endpoint, { ...options, data }),

  patch: <T>(endpoint: string, data: any, options?: FetchOptions) =>
    fetchFCM<T>('PATCH', endpoint, { ...options, data }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    fetchFCM<T>('DELETE', endpoint, options),
}
*/

export async function get<T>(
  endpoint: string,
  options: { params?: Record<string, any> } = {}
): Promise<T> {
  const { params } = options
  const session = await auth()
  const headersList = await headers()

  // Construct URL with query parameters
  const url = new URL(`${API_URL}/${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: session?.accessToken
        ? `Bearer ${session.accessToken}`
        : '',
      Cookie: headersList.get('cookie') || '',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function post<T>(
  endpoint: string,
  data: any,
  options: { params?: Record<string, any> } = {}
): Promise<T> {
  const { params } = options
  const session = await auth()
  const headersList = await headers()

  const url = new URL(`${API_URL}/${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: session?.accessToken
        ? `Bearer ${session.accessToken}`
        : '',
      Cookie: headersList.get('cookie') || '',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
