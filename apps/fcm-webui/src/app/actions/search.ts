'use server'

import { makeServerRequest } from '@/lib/api/axiosConfig'
import { auth } from '@/lib/auth'
import {
  CreateUserSearchDto,
  SearchQueryParams,
  UserSearchDto,
} from '@fcm/shared/user-search/types'

export async function saveSearch(
  searchData: CreateUserSearchDto
): Promise<UserSearchDto> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  try {
    const payload = {
      ...searchData,
      userId: session.user.id,
      favorite: false,
      parameters:
        typeof searchData.parameters === 'string'
          ? searchData.parameters
          : JSON.stringify(searchData.parameters),
      lastUsed: new Date(),
    }

    return await makeServerRequest<UserSearchDto>(
      'POST',
      '/user-searches',
      payload
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save search: ${error.message}`)
    }
    throw new Error('Failed to save search')
  }
}

export async function getUserSearches(
  params?: SearchQueryParams
): Promise<UserSearchDto[]> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  try {
    const searches = await makeServerRequest<UserSearchDto[]>(
      'GET',
      `/user-searches/user/${session.user.email}`,
      undefined,
      params as Record<string, any>
    )

    return searches.map((search) => ({
      ...search,
      parameters:
        typeof search.parameters === 'string'
          ? JSON.parse(search.parameters)
          : search.parameters,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch searches: ${error.message}`)
    }
    throw new Error('Failed to fetch searches')
  }
}

export async function getFavoriteSearches(): Promise<UserSearchDto[]> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  try {
    const searches = await makeServerRequest<UserSearchDto[]>(
      'GET',
      `/user-searches/user/${session.user.id}/favorites`
    )

    return searches.map((search) => ({
      ...search,
      parameters:
        typeof search.parameters === 'string'
          ? JSON.parse(search.parameters)
          : search.parameters,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch favorite searches: ${error.message}`)
    }
    throw new Error('Failed to fetch favorite searches')
  }
}

export async function markSearchUsed(searchId: string): Promise<UserSearchDto> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  try {
    return await makeServerRequest<UserSearchDto>(
      'POST',
      `/user-searches/${searchId}/used`
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to mark search as used: ${error.message}`)
    }
    throw new Error('Failed to mark search as used')
  }
}

export async function toggleSearchFavorite(
  searchId: string
): Promise<UserSearchDto> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  try {
    return await makeServerRequest<UserSearchDto>(
      'POST',
      `/user-searches/${searchId}/toggle-favorite`
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to toggle favorite status: ${error.message}`)
    }
    throw new Error('Failed to toggle favorite status')
  }
}

export async function deleteSearch(searchId: string) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  try {
    await makeServerRequest('DELETE', `/user-searches/${searchId}`)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete search: ${error.message}`)
    }
    throw new Error('Failed to delete search')
  }
}
