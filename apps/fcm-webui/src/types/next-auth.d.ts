import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id: string
      databaseId: string
      email: string
      roles: string[]
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    accessToken?: string
    refreshToken?: string
    roles: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    roles: string[]
  }
}
