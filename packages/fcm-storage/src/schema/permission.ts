import { z } from 'zod'
import { baseEntitySchema } from './base-entity.js'

export const permissionSchema = baseEntitySchema.extend({
  typeId: z.string(),
  roleId: z.string(),
  action: z.string().default(''),
  resource: z.string(),
})

// Schema for creating a new permission
export const createPermissionSchema = permissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

// Schema for updating an existing permission
export const updatePermissionSchema = createPermissionSchema
  .partial()
  .omit({ typeId: true, roleId: true }) // These should not be updateable

// TypeScript types
export type Permission = z.infer<typeof permissionSchema>
export type CreatePermission = z.infer<typeof createPermissionSchema>
export type UpdatePermission = z.infer<typeof updatePermissionSchema>