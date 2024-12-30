import { z } from 'zod'
import { baseEntitySchema } from './base-entity'

// Base schema for user searches
export const userSearchSchema = baseEntitySchema.extend({
  userId: z.string(),
  searchType: z.string(),
  criteria: z.string(), // JSON string
  title: z.string().optional().nullable(),
  favorite: z.boolean(),
  lastUsed: z.date(),
})

// Schema for creating a new search
export const createUserSearchSchema = userSearchSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// Schema for updating an existing search
export const updateUserSearchSchema = createUserSearchSchema.partial()

// TypeScript types
export type UserSearch = z.infer<typeof userSearchSchema>
export type CreateUserSearch = z.infer<typeof createUserSearchSchema>
export type UpdateUserSearch = z.infer<typeof updateUserSearchSchema>
