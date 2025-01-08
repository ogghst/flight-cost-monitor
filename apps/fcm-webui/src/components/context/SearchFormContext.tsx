'use client'

import { UserSearchDto } from '@fcm/shared/user-search/types'
import { createContext, useContext, useState } from 'react'

interface SearchFormContextType {
  currentSearch: UserSearchDto | null
  setCurrentSearch: (search: UserSearchDto | null) => void
}

const SearchFormContext = createContext<SearchFormContextType | undefined>(
  undefined
)

export function SearchFormProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentSearch, setCurrentSearch] = useState<UserSearchDto | null>(null)

  return (
    <SearchFormContext.Provider
      value={{
        currentSearch,
        setCurrentSearch,
      }}>
      {children}
    </SearchFormContext.Provider>
  )
}

export function useSearchForm() {
  const context = useContext(SearchFormContext)
  if (context === undefined) {
    throw new Error('useSearchForm must be used within a SearchFormProvider')
  }
  return context
}

// For backward compatibility
export const useSimpleSearch = useSearchForm
