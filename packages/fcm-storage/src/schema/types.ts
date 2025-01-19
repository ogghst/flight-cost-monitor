export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause: unknown,
    public code?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}
/*
export interface BaseRefreshToken {
  id: string
  token: string
  userId: string
  expiresAt: Date
  revoked: boolean
  replacedByToken?: string | null
  family: string
  generationNumber: number
}
*/
/*
export function toAuthUser(user: UserWithRelations): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username || undefined,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    authType: user.authType,
    oauthProvider: user.oauthProvider || undefined,
    roles: user.roles.map((r) => r.name),
  }
}
*/
