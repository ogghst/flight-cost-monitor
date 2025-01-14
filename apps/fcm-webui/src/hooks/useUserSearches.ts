'use client'

import { useQuery } from '@tanstack/react-query'
import { UserSearchDto, SearchQueryParams } from '@fcm/shared/user-search'
import { SearchType } from '@fcm/shared/auth'
import { TaskType } from '@fcm/shared/scheduler'
import { getUserSearches } from '@/app/actions/search'

// Convert TaskType to SearchType
function getSearchType(taskType: TaskType): SearchType {
  switch (taskType) {
    case TaskType.SIMPLE_SEARCH:
      return SearchType.SIMPLE
    case TaskType.ADVANCED_SEARCH:
      return SearchType.ADVANCED
    default:
      return SearchType.SIMPLE
  }
}

export function useUserSearches(taskType: TaskType) {
  return useQuery({
    queryKey: ['userSearches', taskType],
    queryFn: async () => {
      const params: SearchQueryParams = {
        searchType: getSearchType(taskType)
      }
      const searches = await getUserSearches(params)
      return searches
    },
    enabled: !!taskType, // Only fetch when taskType is available
  })
}