// Define SearchType locally
enum SearchType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  CAR = 'CAR',
}

import { baseEntitySchema } from '@fcm/shared/types'
import { z } from 'zod'

// Base Schema that maps to UserSearch
export const userSearchSchema = baseEntitySchema.extend({
  userEmail: z.string().email(),
  searchType: z.enum(Object.values(SearchType) as [string, ...string[]]),
  parameters: z.string(), // JSON string for SQLite
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  lastUsed: z.date().optional().nullable(),
  useCount: z.number().int().default(0),
  isFavorite: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().optional().nullable(),
})

// CreateUserSearch - schema for creating a user search
export const createUserSearchSchema = z.object({
  userEmail: z.string().email(),
  searchType: z.enum(Object.values(SearchType) as [string, ...string[]]),
  parameters: z.string(), // JSON string
  name: z.string().optional(),
  description: z.string().optional(),
})

// UpdateUserSearch - schema for updating a user search
export const updateUserSearchSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isFavorite: z.boolean().optional(),
})

// Export the types for use in repositories
export type UserSearch = z.infer<typeof userSearchSchema>
export type CreateUserSearch = z.infer<typeof createUserSearchSchema>
export type UpdateUserSearch = z.infer<typeof updateUserSearchSchema>

export function serializeParameters(params: unknown): string {
  return JSON.stringify(params)
}

export function parseParameters<T>(jsonString: string): T {
  return JSON.parse(jsonString) as T
}

// Export SearchType for use in other modules
export { SearchType }
