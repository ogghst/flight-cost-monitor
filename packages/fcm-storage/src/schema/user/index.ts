export * from './base.js'
export * from './create.js'
export * from './update.js'
export * from './password-reset.js'
export * from './types.js'

// Helper functions
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username)
}

export function isValidPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
}

export function sanitizeUser<T extends Record<string, unknown>>(
  user: T,
  fields: Array<keyof T> = ['password', 'passwordResetToken', 'passwordResetExpires']
): Omit<T, typeof fields[number]> {
  const result = { ...user }
  fields.forEach(field => {
    delete result[field]
  })
  return result
}

// Turn any JSON string profile into proper type
export function parseOAuthProfile(profile: string | null): Record<string, unknown> | null {
  if (!profile) return null
  try {
    return JSON.parse(profile)
  } catch {
    return null
  }
}

export function getFullName(user: { firstName?: string | null; lastName?: string | null }): string {
  const parts = []
  if (user.firstName) parts.push(user.firstName)
  if (user.lastName) parts.push(user.lastName)
  return parts.join(' ') || ''
}