import 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    role: Role
  }
  
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      name?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}