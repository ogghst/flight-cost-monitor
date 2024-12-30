import { z } from 'zod'
import { baseEntitySchema } from './base-entity'

export const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  password: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().default(true),
  githubId: z.string().optional().nullable(),
  githubProfile: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
})

// Schema for creating a new user
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// Schema for updating an existing user
export const updateUserSchema = createUserSchema.partial().omit({ email: true }) // Email cannot be updated

// TypeScript types
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
