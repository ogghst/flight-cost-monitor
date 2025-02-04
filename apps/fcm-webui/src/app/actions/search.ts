'use server'

import { api } from '@/lib/api/fetch-client'
import { auth } from '@/lib/auth'
import {
  CreateUserSearchDto,
  SearchQueryParams,
  UserSearchDto,
} from '@fcm/shared/user-search'

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

    return await api.post<UserSearchDto>('/user-searches', payload, {
      // Revalidate user searches
      tags: [`user-searches-${session.user.email}`],
    })
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
  console.log('Session in getUserSearches:', session) // Add this
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  try {
    const searches = await api.get<UserSearchDto[]>(
      `/user-searches/user/${session.user.email}`,
      {
        ...(params && { params }),
        // Cache for 30 seconds
        revalidate: 30,
        tags: [`user-searches-${session.user.email}`],
      }
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
    const searches = await api.get<UserSearchDto[]>(
      `/user-searches/user/${session.user.id}/favorites`,
      {
        // Cache for 30 seconds
        revalidate: 30,
        tags: [`user-favorites-${session.user.id}`],
      }
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
    return await api.post<UserSearchDto>(
      `/user-searches/${searchId}/used`,
      null,
      {
        // Revalidate both user searches and favorites
        tags: [
          `user-searches-${session.user.email}`,
          `user-favorites-${session.user.id}`,
        ],
      }
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
    return await api.post<UserSearchDto>(
      `/user-searches/${searchId}/toggle-favorite`,
      null,
      {
        // Revalidate both user searches and favorites
        tags: [
          `user-searches-${session.user.email}`,
          `user-favorites-${session.user.id}`,
        ],
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to toggle favorite status: ${error.message}`)
    }
    throw new Error('Failed to toggle favorite status')
  }
}

export async function deleteSearch(searchId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  try {
    await api.delete(`/user-searches/${searchId}`, {
      // Revalidate both user searches and favorites
      tags: [
        `user-searches-${session.user.email}`,
        `user-favorites-${session.user.id}`,
      ],
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete search: ${error.message}`)
    }
    throw new Error('Failed to delete search')
  }
}
