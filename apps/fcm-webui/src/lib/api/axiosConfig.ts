'use server'

import { auth } from '@/lib/auth'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    // Get session token
    const session = await auth()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const session = await auth()
    
    if (error.response?.status === 401 && session?.refreshToken) {
      // TODO: Implement token refresh logic here
      // const newTokens = await refreshAccessToken(session.refreshToken);
      // Update session
      // Retry original request
    }
    return Promise.reject(error)
  }
)

export default axiosInstance