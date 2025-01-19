import { z } from 'zod'
import { baseEntitySchema } from '../types/base-entity.js'

export const roleSchema = baseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
})

// Schema for creating a new role
export const createRoleSchema = roleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// Schema for updating an existing role
export const updateRoleSchema = roleSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .partial()

// TypeScript types
export type Role = z.infer<typeof roleSchema>
export type CreateRole = z.infer<typeof createRoleSchema>
export type UpdateRole = z.infer<typeof updateRoleSchema>
