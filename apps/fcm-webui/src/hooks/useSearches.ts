'use client'

import {
  getUserSearches,
  markSearchUsed,
  saveSearch,
} from '@/app/actions/search'
import { showNotification } from '@/services/NotificationService'
import { SearchType } from '@fcm/shared/user-search'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useUserSearches(
  searchType?: (typeof SearchType)[keyof typeof SearchType]
) {
  return useQuery({
    queryKey: ['user-searches', searchType],
    queryFn: async () => {
      try {
        const searches = await getUserSearches({ searchType })
        if (searches.length === 0) {
          showNotification.info('No saved searches found')
        }
        return searches
      } catch (error) {
        showNotification.error('Failed to load saved searches')
        throw error
      }
    },
  })
}

export function useSaveSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSearch,
    onSuccess: (savedSearch) => {
      queryClient.invalidateQueries({ queryKey: ['user-searches'] })
      showNotification.success(
        `Search "${savedSearch.name}" saved successfully`
      )
    },
    onError: (error: Error) => {
      showNotification.error(
        `Failed to save search: ${error.message || 'Unknown error occurred'}`
      )
    },
  })
}

export function useLoadSearch() {
  return useMutation({
    mutationFn: markSearchUsed,
    onSuccess: () => {
      showNotification.success('Search loaded successfully')
    },
    onError: (error: Error) => {
      showNotification.error(
        `Failed to load search: ${error.message || 'Unknown error occurred'}`
      )
    },
  })
}
