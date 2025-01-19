/*
// Type for user with optional relations
export interface UserWithRelations extends User {
  roles: Role[]
  refreshTokens: RefreshToken[]
}
*/

/*
// OAuth Profile types
export interface GitHubProfile {
  id: string
  login: string
  name: string
  email: string
  avatar_url: string
  [key: string]: unknown
}

export interface GoogleProfile {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  [key: string]: unknown
}

export type OAuthProfile = GitHubProfile | GoogleProfile
*/

/*
// Helper type for user properties that can be safely exposed to the client
export type PublicUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'avatar'
  | 'authType'
  | 'oauthProvider'
>
*/
