'use server'

import { auth } from '@/lib/auth'
import axios, { AxiosRequestConfig } from 'axios'
import { headers } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:3001'

export async function createServerAxiosInstance() {
  const session = await auth()
  const headersList = headers()

  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: session?.accessToken
        ? `Bearer ${session.accessToken}`
        : '',
      Cookie: (await headersList).get('cookie') || '',
    },
    withCredentials: true,
    timeout: 10000,
  })
}

export async function makeServerRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  params?: Record<string, any>
): Promise<T> {
  try {
    const axiosInstance = await createServerAxiosInstance()
    const config: AxiosRequestConfig = {
      method,
      url,
      ...(data && { data }),
      ...(params && { params })
    }
    
    const response = await axiosInstance.request<T>(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'An error occurred during the request'
      )
    }
    throw error
  }
}