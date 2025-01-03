import { SearchType } from '@fcm/shared/auth'
import { z } from 'zod'
import { baseEntitySchema } from './base-entity.js'

export const userSearchSchema = baseEntitySchema.extend({
  userId: z.string(),
  searchType: z.enum(Object.values(SearchType) as [string, ...string[]]),
  parameters: z.string(), // JSON string for SQLite
  name: z.string().optional().nullable(),
  favorite: z.boolean().default(false),
  lastUsed: z.date().default(() => new Date()),
})

// Schema for creating a new user search
export const createUserSearchSchema = userSearchSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    parameters: z.string(), // Ensure parameters is passed as JSON string
    lastUsed: z.date().optional(), // Make lastUsed optional for creation
  })

// Schema for updating an existing user search
export const updateUserSearchSchema = userSearchSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// TypeScript types
export type UserSearch = z.infer<typeof userSearchSchema>
export type CreateUserSearch = z.infer<typeof createUserSearchSchema>
export type UpdateUserSearch = z.infer<typeof updateUserSearchSchema>

// Helper functions for parameters
export function serializeParameters(params: unknown): string {
  return JSON.stringify(params)
}

export function parseParameters<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    throw new Error('Failed to parse search parameters')
  }
}

// Utility types for specific search parameters
export interface FlightSearchParameters {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: {
    adults: number
    children?: number
    infants?: number
  }
  cabinClass?: string
  directFlights?: boolean
}

export interface HotelSearchParameters {
  location: string
  checkIn: string
  checkOut: string
  rooms: number
  guests: number
  amenities?: string[]
}
