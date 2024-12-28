import { z } from 'zod'
import { PermissionSchema } from './permission.js'

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  permissions: z.array(PermissionSchema).optional(),
})

export const CreateRoleSchema = RoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  permissions: true,
})

export const UpdateRoleSchema = CreateRoleSchema.partial()

export type Role = z.infer<typeof RoleSchema>
export type CreateRole = z.infer<typeof CreateRoleSchema>
export type UpdateRole = z.infer<typeof UpdateRoleSchema>