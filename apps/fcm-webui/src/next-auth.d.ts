import 'next-auth'
import { DefaultSession, DefaultUser } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshAccessTokenError'
    accessToken: string
    user: {
      id: string
      email: string
      name?: string
      image?: string
      roles: string[]
      accessToken: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name?: string
    image?: string
    roles: string[]
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    accessTokenExpires?: number
    error?: 'RefreshAccessTokenError'
    user?: {
      id: string
      email: string
      roles: string[]
    }
  }
}
