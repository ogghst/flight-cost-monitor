'use client'

import {
  getUserSearches,
  markSearchUsed,
  saveSearch,
} from '@/app/actions/search'
import { SearchType } from '@fcm/shared/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useUserSearches(
  searchType?: (typeof SearchType)[keyof typeof SearchType]
) {
  return useQuery({
    queryKey: ['user-searches', searchType],
    queryFn: () => getUserSearches({ searchType }),
  })
}

export function useSaveSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-searches'] })
    },
  })
}

export function useLoadSearch() {
  return useMutation({
    mutationFn: (searchId: string) => markSearchUsed(searchId),
  })
}
