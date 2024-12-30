import {
  permissionRepository,
  PermissionRepository,
  RoleRepository,
  UserRepository,
} from '@fcm/storage/repositories'
import { createContext, ReactNode, useContext } from 'react'

interface DatabaseContextType {
  userRepository: UserRepository
  roleRepository: RoleRepository
  permissionRepository: PermissionRepository
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const userRepository = new UserRepository()
  const roleRepository = new RoleRepository()
  const contextValue: DatabaseContextType = {
    userRepository,
    roleRepository,
    permissionRepository,
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
