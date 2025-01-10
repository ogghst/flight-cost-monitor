import { z } from 'zod'
import { userSchema } from './base.js'

// Schema for updating user profile
export const updateUserSchema = userSchema.partial().omit({
  id: true,
  email: true,
  authType: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  refreshTokens: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  lastLogin: true,
})

// Schema for updating password
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain uppercase, lowercase, number and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// TypeScript types
export type UpdateUser = z.infer<typeof updateUserSchema>
export type UpdatePassword = z.infer<typeof updatePasswordSchema>
