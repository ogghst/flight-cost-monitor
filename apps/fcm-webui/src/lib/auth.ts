import { parseName } from '@/lib/utils'
import { AuthType, OAuthProvider } from '@fcm/shared/auth'
import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'

export const config = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' },
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.username,
            roles: data.user.roles,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id.toString(),
          githubProfile: profile,
          roles: ['USER'],
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        try {
          const { firstName, lastName } = parseName(profile?.name?.toString())
          const existingUser = await userRepository.findByEmail(user.email!)

          if (existingUser) {
            await userRepository.update(existingUser.id, {
              oauthProviderId: profile?.id?.toString(),
              oauthProfile: JSON.stringify(profile),
              image: profile?.avatar_url?.toString(),
              firstName,
              lastName,
            })
          } else {
            await userRepository.createOAuthUser({
              email: user.email!,
              oauthProviderId: profile?.id?.toString() || '',
              oauthProfile: JSON.stringify(profile),
              image: profile?.avatar_url?.toString(),
              firstName,
              lastName,
              active: true,
              authType: AuthType.OAUTH,
              oauthProvider: OAuthProvider.GITHUB,
            })
          }
          return true
        } catch (error) {
          console.error('Error persisting user:', error)
          return '/auth/error?error=DatabaseError'
        }
      }
      return true
    },
    async jwt({ token, user, profile }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
      }
      if (profile) {
        token.githubId = profile.id
        token.image = profile.avatar_url
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.image as string
        session.user.roles = token.roles as string[]
        if (token.accessToken) {
          session.accessToken = token.accessToken as string
          session.refreshToken = token.refreshToken as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
} as NextAuthConfig

export const { handlers, auth, signIn: sigIn, signOut } = NextAuth(config)
