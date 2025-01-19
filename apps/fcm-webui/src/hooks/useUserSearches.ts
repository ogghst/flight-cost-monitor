'use client'

import { getUserSearches } from '@/app/actions/search'
import { SearchQueryParams, SearchType } from '@fcm/shared/user-search'
import { useQuery } from '@tanstack/react-query'

export function useUserSearches(searchType: SearchType) {
  return useQuery({
    queryKey: ['userSearches', searchType],
    queryFn: async () => {
      const params: SearchQueryParams = {
        searchType: searchType,
      }
      const searches = await getUserSearches(params)
      return searches
    },
    enabled: !!searchType, // Only fetch when taskType is available
  })
}
