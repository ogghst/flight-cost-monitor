import { z } from 'zod'
import { RoleSchema } from './role.js'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  roles: z.array(RoleSchema).optional(),
})

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  roles: true,
}).extend({
  password: z.string().min(8),
})

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  roles: true,
}).extend({
  password: z.string().min(8),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
