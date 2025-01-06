import { TravelClass } from 'src/amadeus/index.js'
import { SearchType } from 'src/auth/types.js'
import { FlightOfferAdvancedSearchRequest } from '../amadeus/clients/flight-offer-advanced/flight-offers-advanced-types.js'
import type {
  FlightOfferSimpleSearchRequest,
  FlightSegment,
} from '../amadeus/clients/flight-offer/flight-offers-types.js'

// Keep existing types as they are
export type { FlightOfferAdvancedSearchRequest as FlightOffersAdvancedSearchRequest } from '../amadeus/clients/flight-offer-advanced/flight-offers-advanced-types.js'
export type { FlightOfferSimpleSearchRequest } from '../amadeus/clients/flight-offer/flight-offers-types.js'

export { TravelClass } from '../amadeus/types/common.js'

// Add new namespace for storage-specific types
export type FlightOfferSearchStatus = 'COMPLETED' | 'FAILED' | 'PARTIAL'

export interface CreateFlightOfferSearchDto {
  userEmail: string
  searchType: SearchType
  parameters: FlightOfferSimpleSearchRequest | FlightOfferAdvancedSearchRequest
  savedSearchId?: string
  status: FlightOfferSearchStatus
  totalResults: number
  results: FlightOfferResultDto[]
}

export interface CreateFlightOfferResultDto {
  offerId: string
  price: number
  validatingCarrier: string
  segments: FlightSegment[]
}

export interface UpdateFlightOfferSearchDto {
  status?: FlightOfferSearchStatus
  parameters?: FlightOfferSimpleSearchRequest | FlightOfferAdvancedSearchRequest
  totalResults?: number
  results: FlightOfferResultDto[]
}

export interface FlightOfferResultDto {
  id: string
  searchId: string
  offerId: string
  price: number
  validatingCarrier: string
  segments: FlightSegment[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface FlightOfferSearchDto {
  id: string
  userEmail: string
  searchType: SearchType
  parameters: string
  savedSearchId?: string
  userSearchId?: string
  status: FlightOfferSearchStatus
  totalResults: number
  results: FlightOfferResultDto[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface FlightOfferSearchParams {
  page?: number
  limit?: number
  fromDate?: Date
  toDate?: Date
  searchType?: SearchType
  minPrice?: number
  maxPrice?: number
  travelClass?: TravelClass
  carriers?: string[]
}

// Utility type for service layer
//export type FlightOfferSearchParameters =
//  | { type: 'SIMPLE'; params: FlightOfferSimpleSearchRequest }
//  | { type: 'ADVANCED'; params: FlightOfferAdvancedSearchRequest }
