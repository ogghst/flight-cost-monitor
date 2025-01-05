'use server'

import axiosInstance from '@/lib/api/axiosConfig'
import { auth } from '@/lib/auth'
import { SearchType } from '@fcm/shared/auth'
import { AxiosError } from 'axios'

export async function saveSearch(searchData: {
  searchType: (typeof SearchType)[keyof typeof SearchType]
  criteria: any
  title?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.post('/search', {
      searchType: searchData.searchType,
      parameters: searchData.criteria,
      name: searchData.title,
      favorite: false,
    })

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to save search')
    }
    throw error
  }
}

export async function getUserSearches(
  searchType?: (typeof SearchType)[keyof typeof SearchType]
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.get('/search', {
      params: searchType ? { type: searchType } : undefined,
    })

    return data.map((search: any) => ({
      ...search,
      criteria:
        typeof search.parameters === 'string'
          ? JSON.parse(search.parameters)
          : search.parameters,
    }))
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch searches'
      )
    }
    throw error
  }
}

export async function getFavoriteSearches() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.get('/search/favorites')

    return data.map((search: any) => ({
      ...search,
      criteria:
        typeof search.parameters === 'string'
          ? JSON.parse(search.parameters)
          : search.parameters,
    }))
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch favorite searches'
      )
    }
    throw error
  }
}

export async function markSearchUsed(searchId: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.patch('/search/' + searchId + '/used')
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to mark search as used'
      )
    }
    throw error
  }
}

export async function toggleSearchFavorite(
  searchId: string,
  favorite: boolean
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.patch(
      '/search/' + searchId + '/favorite',
      {
        favorite,
      }
    )
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to toggle favorite status'
      )
    }
    throw error
  }
}

export async function deleteSearch(searchId: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('User not authenticated')
    }

    const { data } = await axiosInstance.delete('/search/' + searchId)
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete search'
      )
    }
    throw error
  }
}
