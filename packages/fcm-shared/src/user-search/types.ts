import { FlightOfferAdvancedSearchRequest } from 'src/amadeus/clients/flight-offer-advanced/flight-offers-advanced-types.js'
import { SearchType } from 'src/auth/types.js'
import { FlightOfferSimpleSearchRequest } from 'src/flight-offer-search/types.js'

export interface UserSearchDto {
  id: string
  userEmail: string
  searchType: SearchType
  parameters: FlightOfferSimpleSearchRequest | FlightOfferAdvancedSearchRequest // | Record<string, string>
  name?: string
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
