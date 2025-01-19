import { z } from 'zod'

// Schema for requesting a password reset
export const passwordResetRequestSchema = z.object({
  email: z.string().email()
})

// Schema for resetting password with token
export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

// TypeScript types
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>
export type PasswordReset = z.infer<typeof passwordResetSchema>