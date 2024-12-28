import { userRepository } from '@/lib/storage'
import { UserRepository } from '@fcm/storage'
import { createContext, ReactNode, useContext } from 'react'

interface DatabaseContextType {
  userRepository: UserRepository
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const contextValue: DatabaseContextType = {
    userRepository,
  }

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}
