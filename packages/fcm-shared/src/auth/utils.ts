import crypto from 'crypto'

/**
 * Generate a secure random token
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Generate a refresh token family ID
 */
export function generateTokenFamily(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Sanitize user object for response
 * Removes sensitive fields like password
 */
export function sanitizeUser<T extends { password?: string }>(
  user: T
): Omit<T, 'password'> {
  const { password, ...sanitized } = user
  return sanitized
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*]/.test(password)

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  )
}

/**
 * Calculate token expiration date
 */
export function calculateTokenExpiration(durationInSeconds: number): Date {
  return new Date(Date.now() + durationInSeconds * 1000)
}

/**
 * Compare two timestamps safely
 */
export function isTokenExpired(expirationDate: Date): boolean {
  return expirationDate.getTime() <= Date.now()
}

/**
 * Format OAuth user data consistently
 */
export function normalizeOAuthProfile(provider: string, profile: any): any {
  const normalized = {
    id: profile.id || profile.sub,
    email: profile.email,
    firstName: profile.given_name || profile.first_name,
    lastName: profile.family_name || profile.last_name,
    name: profile.name,
    image: profile.picture || profile.avatar_url,
    rawProfile: profile,
  }

  // Ensure email is present
  if (!normalized.email) {
    throw new Error('OAuth profile must contain an email')
  }

  return normalized
}
