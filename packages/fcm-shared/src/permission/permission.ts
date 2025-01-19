import { z } from 'zod'
import { baseEntitySchema } from '../types/base-entity.js'

// Permission schema matches Prisma schema
export const permissionSchema = baseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional().nullable(),
})

// Schema for creating a new permission
export const createPermissionSchema = permissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// Schema for updating an existing permission
export const updatePermissionSchema = createPermissionSchema.partial()

// TypeScript types
export type PermissionDto = z.infer<typeof permissionSchema>
export type CreatePermissionDto = z.infer<typeof createPermissionSchema>
export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>

// Predefined permission types
export const PERMISSION_TYPES = [
  'user:read',
  'user:write',
  'flight:read',
  'flight:write',
] as const

export type PermissionType = (typeof PERMISSION_TYPES)[number]
