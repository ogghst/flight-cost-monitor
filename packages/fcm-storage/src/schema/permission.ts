import { z } from 'zod'

export const PermissionTypeSchema = z.enum(['READ', 'WRITE', 'DELETE', 'ADMIN'])

export const PermissionSchema = z.object({
  id: z.string(),
  typeId: z.string(),
  resource: z.string(),
  roleId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreatePermissionSchema = PermissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdatePermissionSchema = CreatePermissionSchema.partial()

export type PermissionType = z.infer<typeof PermissionTypeSchema>
export type Permission = z.infer<typeof PermissionSchema>
export type CreatePermission = z.infer<typeof CreatePermissionSchema>
export type UpdatePermission = z.infer<typeof UpdatePermissionSchema>
