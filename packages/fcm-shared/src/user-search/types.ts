import { SearchType } from 'src/auth/types.js'

export interface UserSearchDto {
  id: string
  userEmail: string
  searchType: SearchType
  name?: string
  parameters: string
  favorite: boolean
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserSearchDto {
  userEmail: string
  searchType: SearchType
  parameters: string // | Record<string, string>
  name?: string
  favorite: boolean
}

export interface UpdateUserSearchDto {
  id: string
  name?: string
  parameters: string
  favorite?: boolean
}

// API Error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, string>
}

// Search query parameters
export interface SearchQueryParams {
  searchType?: SearchType
  page?: number
  limit?: number
}
