'use server'

import { auth } from '@/lib/auth'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies
  timeout: 10000,
})

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await auth()
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
      }
      return config
    } catch (error) {
      console.error('Error getting auth session:', error)
      return config
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Token refresh failed')
        }

        const data = await response.json()
        
        // Update the token in sessionStorage
        tokenStorage.setAccessToken(data.accessToken)
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        
        // Retry the original request
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/auth/signin'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance