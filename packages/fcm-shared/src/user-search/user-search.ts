import { baseEntitySchema } from '../types/base-entity.js'
import { SearchType } from '../user-search/index.js'

import { z } from 'zod'

// Base Schema that maps to UserSearchDto
export const userSearchSchema = baseEntitySchema.extend({
  id: z.string(),
  userEmail: z.string().email(),
  searchType: z.nativeEnum(SearchType),
  parameters: z.string(), // JSON string for SQLite
  name: z.string().optional().nullable(),
  favorite: z.boolean().default(false),
  lastUsed: z.date().default(() => new Date()),
})

// Create Schema that maps to CreateUserSearchDto
export const createUserSearchSchema = z.object({
  userEmail: z.string().email(),
  searchType: z.nativeEnum(SearchType),
  parameters: z.string(), // JSON string
  name: z.string().optional(),
  favorite: z.boolean().default(false),
})

// Update Schema that maps to UpdateUserSearchDto
export const updateUserSearchSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  parameters: z.string(),
  favorite: z.boolean().optional(),
})

// Helper functions for parameters
export function serializeParameters(params: unknown): string {
  return JSON.stringify(params)
}

export function parseParameters<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    throw new Error('Failed to parse search parameters: ' + error)
  }
}

export interface SearchQueryParams {
  searchType?: SearchType
  page?: number
  limit?: number
}

export type UserSearchDto = z.infer<typeof userSearchSchema>
export type CreateUserSearchDto = z.infer<typeof createUserSearchSchema>
export type UpdateUserSearchDto = z.infer<typeof updateUserSearchSchema>
